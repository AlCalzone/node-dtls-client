/// <reference types="node" />
import * as dgram from "dgram";
import { dtls } from "../dtls";
import { Message } from "../TLS/Message";
export declare class RecordLayer {
    private udpSocket;
    private options;
    constructor(udpSocket: dgram.Socket, options: dtls.Options);
    send(msg: Message, callback?: dtls.SendCallback): void;
    /**
     * Connection states ordered by epochs
     */
    private connectionStates;
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
    private _writeSequenceNumber;
    readonly writeSequenceNumber: number;
    advanceReadEpoch(): void;
    advanceWriteEpoch(): void;
    private ensurePendingState();
    readonly nextEpoch: number;
    /**
     * Maximum transfer unit of the underlying connection.
     * Note: Ethernet supports up to 1500 bytes, of which 20 bytes are reserved for the IP header and 8 for the UDP header
     */
    MTU: number;
    readonly MTU_OVERHEAD: number;
    readonly MAX_PAYLOAD_SIZE: number;
    static IMPLEMENTED_PROTOCOL_VERSION: any;
}
