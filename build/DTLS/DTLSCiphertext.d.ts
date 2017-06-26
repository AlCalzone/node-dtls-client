/// <reference types="node" />
import * as TypeSpecs from "../TLS/TypeSpecs";
import { TLSStruct } from "../TLS/TLSStruct";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { ContentType } from "../TLS/ContentType";
import { DTLSCompressed } from "./DTLSCompressed";
import { CipherDelegate, DecipherDelegate, MacDelegate } from "../TLS/CipherSuite";
export declare class DTLSCiphertext extends TLSStruct {
    type: ContentType;
    version: ProtocolVersion;
    epoch: number;
    sequence_number: number;
    fragment: Buffer;
    static readonly __spec: {
        type: TypeSpecs.Enum;
        version: TypeSpecs.Struct;
        epoch: Readonly<TypeSpecs.Number>;
        sequence_number: Readonly<TypeSpecs.Number>;
        fragment: TypeSpecs.Vector;
    };
    static readonly spec: TypeSpecs.Struct;
    constructor(type: ContentType, version: ProtocolVersion, epoch: number, sequence_number: number, fragment: Buffer);
    /**
     * Encrypts the given compressed packet
     * @param packet - The packet to be encrypted
     * @param cipher - The cipher used to encrypt the given packet
     * @param outgoingMac - The MAC function used for outgoing packets
     */
    static encrypt(packet: DTLSCompressed, cipher: CipherDelegate, outgoingMac: MacDelegate): DTLSCiphertext;
    /**
     * Decrypts this packet into a compressed packet
     * @param decipher - The decipher used to decrypt this packet
     * @param incomingMac - The MAC function used for incoming packets
     */
    decrypt(decipher: DecipherDelegate, incomingMac: MacDelegate): DTLSCompressed;
}
