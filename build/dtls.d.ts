/// <reference types="node" />
import { EventEmitter } from "events";
import * as dgram from "dgram";
export declare module dtls {
    /**
     * Creates a DTLS-secured socket.
     * @param options - The options used to create the socket
     * @param callback - If provided, callback is bound to the "message" event
     */
    function createSocket(options: Options, callback?: MessageEventHandler): Socket;
    /**
     * DTLS-secured UDP socket. Can be used as a drop-in replacement for dgram.Socket
     */
    class Socket extends EventEmitter {
        private options;
        /**
         * INTERNAL USE, DON'T CALL DIRECTLY. use createSocket instead!
         */
        constructor(options: Options);
        private recordLayer;
        /**
         * Send the given data. It is automatically compressed and encrypted.
         */
        send(data: Buffer, callback?: SendCallback): void;
        close(callback?: CloseEventHandler): void;
        private udp;
        private udp_onListening();
        private udp_onMessage(msg, rinfo);
        private udp_onClose();
        private udp_onError(exception);
    }
    interface Options {
        type: "udp4" | "udp6";
        reuseAddr: boolean;
        address: string;
        port: number;
        keyContext: any;
    }
    type ListeningEventHandler = () => void;
    type MessageEventHandler = (msg: Buffer, rinfo: dgram.RemoteInfo) => void;
    type CloseEventHandler = () => void;
    type ErrorEventHandler = (exception: Error) => void;
    type SendCallback = (error: Error, bytes: number) => void;
}
