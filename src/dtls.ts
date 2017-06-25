import { EventEmitter } from "events";
import * as dgram from "dgram";

export module dtls {

	/**
	 * Creates a DTLS-secured socket.
	 * @param options - The options used to create the socket
	 * @param callback - If provided, callback is bound to the "message" event
	 */
	export function createSocket(options: Options, callback?: MessageEventHandler): Socket {
		const ret = new Socket(options);
		if (callback != null) ret.on("message", callback);
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
			this.udp = dgram
				.createSocket(options, this.udp_onMessage)
				.on("listening", this.udp_onListening)
				.on("message", this.udp_onMessage)
				.on("close", this.udp_onClose)
				.on("error", this.udp_onError)
				;
		}

		send(msg: Buffer, port: number, address?: string, callback?: SendCallback) {
		//send(msg: Buffer, offset: number, length: number, port: number, address?: string, callback?: SendCallback) {
			// TODO: for now only allow the short syntax. Enable alternative definitions later

			// TODO: modify data

			// send finished data over UDP
			this.udp.send(msg, port, address, callback);
		}

		close(callback?: CloseEventHandler) {
			if (callback) this.on("close", callback);
			this.udp.close();
		}

		/*
			Internal Socket handler functions
		*/
		private udp: dgram.Socket;

		private udp_onListening() {
			// TODO handle data

			this.emit("listening");
		}
		private udp_onMessage(msg: Buffer, rinfo: dgram.RemoteInfo) {
			// TODO handle data

			// TODO: extend params?
			this.emit("message", msg, rinfo);
		}
		private udp_onClose() {
			// TODO
			this.emit("close");
		}
		private udp_onError(exception: Error) {
			this.emit("error", exception);
		}
		
	}

	export interface Options {
		type: "udp4" | "udp6";
		reuseAddr: boolean;
	// TODO: DTLS-security options
	}

	export type ListeningEventHandler = () => void;
	export type MessageEventHandler = (msg: Buffer, rinfo: dgram.RemoteInfo) => void;
	export type CloseEventHandler = () => void;
	export type ErrorEventHandler = (exception: Error) => void;
	export type SendCallback = (error: Error, bytes: number) => void;
}

