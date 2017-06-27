/// <reference types="node" />
import * as dgram from "dgram";
import { dtls } from "../dtls";
import { Message } from "../TLS/Message";
export declare class RecordLayer {
    private udpSocket;
    private options;
    constructor(udpSocket: dgram.Socket, options: dtls.Options);
    /**
     * Transforms the given message into a DTLSCiphertext packet and sends it via UDP
     * @param msg The message to be sent
     * @param callback The function to be called after sending the message.
     */
    send(msg: Message, callback?: dtls.SendCallback): void;
    /**
     * Receives DTLS messages from the given buffer.
     * @param buf The buffer containing DTLSCiphertext packets
     */
    receive(buf: Buffer): Message[];
    /**
     * All known connection epochs
     */
    private epochs;
    /**
     * The current epoch used for reading data
     */
    private _readEpoch;
    readonly readEpoch: number;
    /**
     * The current epoch used for writing data
     */
    private _writeEpoch;
    readonly writeEpoch: number;
    /**
     * The epoch that will be used next
     */
    readonly nextEpoch: number;
    /**
     * Ensure there's a next epoch to switch to
     */
    private ensureNextEpoch();
    private createEpoch(index);
    advanceReadEpoch(): void;
    advanceWriteEpoch(): void;
    /**
     * Maximum transfer unit of the underlying connection.
     * Note: Ethernet supports up to 1500 bytes, of which 20 bytes are reserved for the IP header and 8 for the UDP header
     */
    static MTU: number;
    static readonly MTU_OVERHEAD: number;
    static readonly MAX_PAYLOAD_SIZE: number;
}
