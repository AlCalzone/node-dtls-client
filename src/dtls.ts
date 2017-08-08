import * as dgram from "dgram";
import { EventEmitter } from "events";
import { FragmentedHandshake } from "./DTLS/Handshake";
import { ClientHandshakeHandler } from "./DTLS/HandshakeHandler";
import { RecordLayer } from "./DTLS/RecordLayer";
import { ChangeCipherSpec } from "./TLS/ChangeCipherSpec";
import { ContentType } from "./TLS/ContentType";
import { Message } from "./TLS/Message";
import { TLSStruct } from "./TLS/TLSStruct";

export namespace dtls {

	/**
	 * Creates a DTLS-secured socket.
	 * @param options - The options used to create the socket
	 * @param callback - If provided, callback is bound to the "message" event
	 */
	export function createSocket(options: Options, callback?: MessageEventHandler): Socket {
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
			this._connectionTimeout = setTimeout(this.expectConnection, this.options.timeout);

			// start the connection
			this.udp.bind();
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

		public close(callback?: CloseEventHandler) {
			if (callback) this.once("close", callback);
			this.udp.close();
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
			this._connectionTimeout = setTimeout(this.expectHandshake, this.options.timeout);
			// also start handshake
			this.handshakeHandler = new ClientHandshakeHandler(this.recordLayer, this.options, (err?: Error) => {
				if (err) {
					// something happened on the way to heaven
					this.emit("error", err);
					this.udp.close();
				} else {
					// when done, emit "connected" event
					this._handshakeFinished = true;
					if (this._connectionTimeout != null) clearTimeout(this._connectionTimeout);
					this.emit("connected");
					// also emit all buffered messages
					while (this.bufferedMessages.length > 0) {
						const {msg, rinfo} = this.bufferedMessages.shift();
						this.emit("message", msg.data, rinfo);
					}
				}
			});
		}
		// is called after the connection timeout expired.
		// Check the connection and throws if it is not established yet
		private expectConnection() {
			if (!this._udpConnected) {
				// connection timed out
				this.killConnection(new Error("The connection timed out"));
			}
		}
		private expectHandshake() {
			if (!this._handshakeFinished) {
				// handshake timed out
				this.killConnection(new Error("The DTLS handshake timed out"));
			}
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
						// TODO: read spec to see how we handle this
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
			this._isClosed = true;
			// we no longer want to receive events
			this.udp.removeAllListeners();
			this.emit("close");
		}
		private udp_onError(exception: Error) {
			this.emit("error", exception);
		}

		/** Kills the underlying UDP connection and emits an error if neccessary */
		private killConnection(err?: Error) {
			this._isClosed = true;
			this.udp.removeAllListeners();
			this.udp.close();
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
	}

	export type ListeningEventHandler = () => void;
	export type MessageEventHandler = (msg: Buffer, rinfo: dgram.RemoteInfo) => void;
	export type CloseEventHandler = () => void;
	export type ErrorEventHandler = (exception: Error) => void;
	export type SendCallback = (error: Error, bytes: number) => void;
}
