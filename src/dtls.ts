// enable debug output
import * as debugPackage from "debug";
import * as dgram from "dgram";
import { EventEmitter } from "events";
import { CipherSuites } from "./DTLS/CipherSuites";
import { FragmentedHandshake } from "./DTLS/Handshake";
import { ClientHandshakeHandler } from "./DTLS/HandshakeHandler";
import { RecordLayer } from "./DTLS/RecordLayer";
import { Alert, AlertDescription, AlertLevel } from "./TLS/Alert";
import { ContentType } from "./TLS/ContentType";
import { Message } from "./TLS/Message";
import { TLSStruct } from "./TLS/TLSStruct";

const debug = debugPackage("node-dtls-client");

export namespace dtls {

	/**
	 * Creates a DTLS-secured socket.
	 * @param options - The options used to create the socket
	 * @param callback - If provided, callback is bound to the "message" event
	 */
	export function createSocket(options: Options, callback?: MessageEventHandler): Socket {
		checkOptions(options);
		const ret = new Socket(options);

		// bind "message" event after the handshake is finished
		if (callback != null) {
			ret.once("connected", () => {
				ret.on("message", callback);
			});
		}
		return ret;
	}

	/**
	 * DTLS-secured UDP socket. Can be used as a drop-in replacement for dgram.Socket
	 */
	export class Socket extends EventEmitter {

		/**
		 * INTERNAL USE, DON'T CALL DIRECTLY. use createSocket instead!
		 */
		constructor(private options: Options) {
			super();
			// setup the connection
			this.udp = dgram
				.createSocket(options)
				.on("listening", this.udp_onListening.bind(this))
				.on("message", this.udp_onMessage.bind(this))
				.on("close", this.udp_onClose.bind(this))
				.on("error", this.udp_onError.bind(this))
				;

			// setup a timeout watcher. Default: 1000ms timeout, minimum: 100ms
			this.options.timeout = Math.max(100, this.options.timeout || 1000);
			this._udpConnected = false;
			this._connectionTimeout = setTimeout(() => this.expectConnection(), this.options.timeout);

			// start the connection
			if(options.listenPort != undefined) {
				this.udp.bind(options.listenPort);
			} else {
				this.udp.bind();
			}
		}

		private recordLayer: RecordLayer;
		private handshakeHandler: ClientHandshakeHandler;
		private _handshakeFinished: boolean = false;
		private _udpConnected: boolean;
		private _connectionTimeout: NodeJS.Timer;

		/**
		 * Send the given data. It is automatically compressed and encrypted.
		 */
		public send(data: Buffer, callback?: SendCallback) {

			if (this._isClosed) {
				throw new Error("The socket is closed. Cannot send data.");
			}
			if (!this._handshakeFinished) {
				throw new Error("DTLS handshake is not finished yet. Cannot send data.");
			}

			// send finished data over UDP
			const packet: Message = {
				type: ContentType.application_data,
				data: data,
			};

			this.recordLayer.send(packet, callback);
		}

		/**
		 * Closes the connection
		 */
		public close(callback?: CloseEventHandler) {
			this.sendAlert(
				new Alert(AlertLevel.warning, AlertDescription.close_notify),
				(e) => {
					this.udp.close();
					if (callback) this.once("close", callback);
				},
			);
		}

		// buffer messages while handshaking
		private bufferedMessages: {msg: Message, rinfo: dgram.RemoteInfo}[] = [];

		/*
			Internal Socket handler functions
		*/
		private udp: dgram.Socket;

		private udp_onListening() {
			// connection successful
			this._udpConnected = true;
			if (this._connectionTimeout != null) clearTimeout(this._connectionTimeout);
			// initialize record layer
			this.recordLayer = new RecordLayer(this.udp, this.options);
			// reuse the connection timeout for handshake timeout watching
			this._connectionTimeout = setTimeout(() => this.expectHandshake(), this.options.timeout);
			// also start handshake
			this.handshakeHandler = new ClientHandshakeHandler(this.recordLayer, this.options,
				(alert?: Alert, err?: Error) => {
					const nextStep = () => {
						// if we have an error, terminate the connection
						if (err) {
							// something happened on the way to heaven
							this.killConnection(err);
						} else {
							// when done, emit "connected" event
							this._handshakeFinished = true;
							if (this._connectionTimeout != null) clearTimeout(this._connectionTimeout);
							this.emit("connected");
							// also emit all buffered messages
							for (const { msg, rinfo } of this.bufferedMessages) {
								this.emit("message", msg.data, rinfo);
							}
							this.bufferedMessages = [];
						}
					};
					// if we have an alert, send it to the other party
					if (alert) {
						this.sendAlert(alert, nextStep);
					} else {
						nextStep();
					}
				},
			);
		}
		// is called after the connection timeout expired.
		// Check the connection and throws if it is not established yet
		private expectConnection() {
			if (!this._isClosed && !this._udpConnected) {
				// connection timed out
				this.killConnection(new Error("The connection timed out"));
			}
		}
		private expectHandshake() {
			if (!this._isClosed && !this._handshakeFinished) {
				// handshake timed out
				this.killConnection(new Error("The DTLS handshake timed out"));
			}
		}

		public sendAlert(alert: Alert, callback?: SendCallback): void {
			// send alert to the other party
			const packet: Message = {
				type: ContentType.alert,
				data: alert.serialize(),
			};
			this.recordLayer.send(packet, callback);
		}

		private udp_onMessage(udpMsg: Buffer, rinfo: dgram.RemoteInfo) {
			// decode the messages
			const messages = this.recordLayer.receive(udpMsg);

			// TODO: implement retransmission.
			for (const msg of messages) {
				switch (msg.type) {
					case ContentType.handshake:
						const handshake = TLSStruct.from(FragmentedHandshake.spec, msg.data).result as FragmentedHandshake;
						this.handshakeHandler.processIncomingMessage(handshake);
						break;
					case ContentType.change_cipher_spec:
						this.recordLayer.advanceReadEpoch();
						break;
					case ContentType.alert:
						const alert = TLSStruct.from(Alert.spec, msg.data).result as Alert;
						if (alert.level === AlertLevel.fatal) {
							// terminate the connection when receiving a fatal alert
							const errorMessage = `received fatal alert: ${AlertDescription[alert.description]}`;
							debug(errorMessage);
							this.killConnection(new Error(errorMessage));
						} else if (alert.level === AlertLevel.warning) {
							// not sure what to do with most warning alerts
							switch (alert.description) {
								case AlertDescription.close_notify:
									// except close_notify, which means we should terminate the connection
									this.close();
									break;
							}
						}
						break;

					case ContentType.application_data:
						if (!this._handshakeFinished) {
							// if we are still shaking hands, buffer the message until we're done
							this.bufferedMessages.push({msg, rinfo});
						} else /* finished */ {
							// else emit the message
							// TODO: extend params?
							// TODO: do we need to emit rinfo?
							this.emit("message", msg.data, rinfo);
						}
						break;
				}
			}
		}

		private _isClosed: boolean = false;
		private udp_onClose() {
			// we no longer want to receive events
			this.udp.removeAllListeners();
			if (!this._isClosed) {
				this._isClosed = true;
				this.emit("close");
			}
		}
		private udp_onError(exception: Error) {
			this.killConnection(exception);
		}

		/** Kills the underlying UDP connection and emits an error if neccessary */
		private killConnection(err?: Error) {
			if (this._isClosed) return;

			this._isClosed = true;
			if (this._connectionTimeout != null) clearTimeout(this._connectionTimeout);
			if (this.udp != null) {
				// keep the error handler around or we get spurious ENOTFOUND errors unhandled
				this.udp.removeAllListeners("listening");
				this.udp.removeAllListeners("message");
				this.udp.removeAllListeners("close");
				this.udp.close();
			}
			if (err != null) this.emit("error", err);
		}

	}

	export interface Options {
		/** the type of the underlying socket */
		type: "udp4" | "udp6";
		/** ?? see NodeJS docs */
		reuseAddr?: boolean;
		/** The remote address to connect to */
		address: string;
		/** The remote port to connect to */
		port: number;
		/** Pre shared key information as a table <identity> => <psk> */
		psk: { [identity: string]: string };
		/** Time after which a connection should successfully established */
		timeout?: number;
		// keyContext?: any; // TODO: DTLS-security options
		/**
		 * The cipher suites to offer to the server.
		 * All supported cipher suites are used if not specified otherwise.
		 */
		ciphers?: (keyof typeof CipherSuites)[];
		/** The local port to listen at */
		listenPort?: number;
	}
	/**
	 * Checks if a given object adheres to the Options interface definition
	 * Throws if it doesn't.
	 */
	function checkOptions(opts: Options) {
		if (opts == null) throw new Error("No connection options were given!");
		if (opts.type !== "udp4" && opts.type !== "udp6") throw new Error(`The connection options must have a "type" property with value "udp4" or "udp6"!`);
		if (typeof opts.address !== "string" || opts.address.length === 0) throw new Error(`The connection options must contain the remote address as a string!`);
		if (typeof opts.port !== "number" || opts.port < 1 || opts.port > 65535) throw new Error(`The connection options must contain a remote port from 1 to 65535!`);
		if (opts.listenPort != undefined) {
			if (typeof opts.listenPort !== "number" || !Number.isInteger(opts.listenPort) || opts.listenPort < 1 || opts.listenPort > 65535) throw new Error(`The listen port must be between 1 and 65535!`);
		}
		if (typeof opts.psk !== "object") throw new Error(`The connection options must contain a PSK dictionary object!`);
	}

	export type ListeningEventHandler = () => void;
	export type MessageEventHandler = (msg: Buffer, rinfo: dgram.RemoteInfo) => void;
	export type CloseEventHandler = () => void;
	export type ErrorEventHandler = (exception: Error) => void;
	export type SendCallback = (error: Error, bytes: number) => void;
}
