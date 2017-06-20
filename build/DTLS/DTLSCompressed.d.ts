/// <reference types="node" />
import * as TLSTypes from "../TLS/TLSTypes";
import { TLSStruct } from "../TLS/TLSStruct";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { ContentType } from "../TLS/ContentType";
import { DTLSPlaintext } from "./DTLSPlaintext";
export declare class DTLSCompressed extends TLSStruct {
    type: ContentType;
    version: ProtocolVersion;
    epoch: number;
    sequence_number: number;
    fragment: Buffer;
    static readonly __spec: {
        type: TLSTypes.Enum;
        version: {
            major: string;
            minor: string;
        };
        epoch: string;
        sequence_number: string;
        fragment: TLSTypes.Vector;
    };
    constructor(type: ContentType, version: ProtocolVersion, epoch: number, sequence_number: number, fragment: Buffer);
    /**
     * Compresses the given plaintext packet
     * @param packet - The plaintext packet to be compressed
     * @param compressor - The compressor function used to compress the given packet
     */
    static compress(packet: DTLSPlaintext, compressor: CompressorDelegate): DTLSCompressed;
    /**
     * Decompresses this packet into a plaintext packet
     * @param decompressor - The decompressor function used to decompress this packet
     */
    decompress(decompressor: DecompressorDelegate): DTLSPlaintext;
    /**
     * Computes the MAC header representing this packet. The MAC header is the input buffer of the MAC calculation minus the actual fragment buffer.
     */
    computeMACHeader(): Buffer;
}
export declare type CompressorDelegate = (plaintext: Buffer) => Buffer;
export declare type DecompressorDelegate = (compressed: Buffer) => Buffer;
export declare class MACHeader extends TLSStruct {
    epoch: number;
    sequence_number: number;
    type: ContentType;
    version: ProtocolVersion;
    fragment_length: number;
    static readonly __spec: {
        epoch: string;
        sequence_number: string;
        type: TLSTypes.Enum;
        version: {
            major: string;
            minor: string;
        };
        fragment_length: string;
    };
    constructor(epoch: number, sequence_number: number, type: ContentType, version: ProtocolVersion, fragment_length: number);
}
