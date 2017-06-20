export declare class RecordLayer {
    /**
     * Maximum transfer unit of the underlying connection.
     * Note: Ethernet supports up to 1500 bytes, of which 20 bytes are reserved for the IP header and 8 for the UDP header
     */
    static MTU: number;
    static readonly MTU_OVERHEAD: number;
    static readonly MAX_PAYLOAD_SIZE: number;
}
