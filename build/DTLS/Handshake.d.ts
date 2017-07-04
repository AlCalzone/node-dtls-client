/// <reference types="node" />
import * as TypeSpecs from "../TLS/TypeSpecs";
import { TLSStruct } from "../TLS/TLSStruct";
import { Random } from "../TLS/Random";
import { CompressionMethod } from "../TLS/ConnectionState";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { Extension } from "../TLS/Extension";
import { Vector } from "../TLS/Vector";
export declare enum HandshakeType {
    hello_request = 0,
    client_hello = 1,
    server_hello = 2,
    hello_verify_request = 3,
    certificate = 11,
    server_key_exchange = 12,
    certificate_request = 13,
    server_hello_done = 14,
    certificate_verify = 15,
    client_key_exchange = 16,
    finished = 20,
}
export declare abstract class Handshake extends TLSStruct {
    msg_type: HandshakeType;
    constructor(msg_type: HandshakeType, bodySpec: TypeSpecs.StructSpec, initial?: any);
    message_seq: number;
    /**
     * Fragments this packet into a series of packets according to the configured MTU
     * @returns An array of fragmented handshake messages - or a single one if it is small enough.
     */
    fragmentMessage(): FragmentedHandshake[];
    /**
     * Parses a re-assembled handshake message into the correct object struture
     * @param assembled - the re-assembled (or never-fragmented) message
     */
    static parse(assembled: FragmentedHandshake): Handshake;
}
export declare class FragmentedHandshake extends TLSStruct {
    msg_type: HandshakeType;
    total_length: number;
    message_seq: number;
    fragment_offset: number;
    fragment: Vector<number>;
    static readonly __spec: {
        msg_type: TypeSpecs.Enum;
        total_length: Readonly<TypeSpecs.Number>;
        message_seq: Readonly<TypeSpecs.Number>;
        fragment_offset: Readonly<TypeSpecs.Number>;
        fragment: TypeSpecs.Vector;
    };
    static readonly spec: TypeSpecs.Struct;
    /**
     * The amount of data consumed by a handshake message header (without the actual fragment)
     */
    static readonly headerLength: number;
    constructor(msg_type: HandshakeType, total_length: number, message_seq: number, fragment_offset: number, fragment: Vector<number>);
    static createEmpty(): FragmentedHandshake;
    /**
     * Checks if this message is actually fragmented, i.e. total_length > fragment_length
     */
    isFragmented(): boolean;
    /**
     * Enforces an array of fragments to belong to a single message
     * @throws Error
     */
    private static enforceSingleMessage(fragments);
    /**
     * In the given array of fragments, find all that belong to the reference fragment
     * @param fragments - Array of fragments to be searched
     * @param reference - The reference fragment whose siblings should be found
     */
    static findAllFragments(fragments: FragmentedHandshake[], reference: FragmentedHandshake): FragmentedHandshake[];
    /**
     * Checks if the provided handshake fragments form a complete message
     */
    static isComplete(fragments: FragmentedHandshake[]): boolean;
    /**
     * Reassembles a series of fragmented handshake messages into a complete one.
     * Warning: doesn't check for validity, do that in advance!
     */
    static reassemble(messages: FragmentedHandshake[]): FragmentedHandshake;
}
export declare class HelloRequest extends Handshake {
    static readonly __spec: {};
    constructor();
    static createEmpty(): HelloRequest;
}
export declare class ClientHello extends Handshake {
    client_version: ProtocolVersion;
    random: Random;
    session_id: Vector<number>;
    cookie: Vector<number>;
    cipher_suites: Vector<number>;
    compression_methods: Vector<CompressionMethod>;
    extensions: Vector<Extension>;
    static readonly __spec: {
        client_version: TypeSpecs.Struct;
        random: TypeSpecs.Struct;
        session_id: TypeSpecs.Vector;
        cookie: TypeSpecs.Vector;
        cipher_suites: TypeSpecs.Vector;
        compression_methods: TypeSpecs.Vector;
        extensions: TypeSpecs.Vector;
    };
    constructor(client_version: ProtocolVersion, random: Random, session_id: Vector<number>, cookie: Vector<number>, cipher_suites: Vector<number>, compression_methods: Vector<CompressionMethod>, extensions: Vector<Extension>);
    static createEmpty(): ClientHello;
}
export declare class ServerHello extends Handshake {
    server_version: ProtocolVersion;
    random: Random;
    session_id: Vector<number>;
    cipher_suite: number;
    compression_method: CompressionMethod;
    extensions: Vector<Extension>;
    static readonly __spec: {
        server_version: TypeSpecs.Struct;
        random: TypeSpecs.Struct;
        session_id: TypeSpecs.Vector;
        cipher_suite: Readonly<TypeSpecs.Number>;
        compression_method: TypeSpecs.Enum;
        extensions: TypeSpecs.Vector;
    };
    constructor(server_version: ProtocolVersion, random: Random, session_id: Vector<number>, cipher_suite: number, compression_method: CompressionMethod, extensions: Vector<Extension>);
    static createEmpty(): ServerHello;
}
export declare class HelloVerifyRequest extends Handshake {
    server_version: ProtocolVersion;
    cookie: Vector<number>;
    static readonly __spec: {
        server_version: TypeSpecs.Struct;
        cookie: TypeSpecs.Vector;
    };
    constructor(server_version: ProtocolVersion, cookie: Vector<number>);
    static createEmpty(): HelloVerifyRequest;
}
export declare class ServerKeyExchange extends Handshake {
    static readonly __spec: {
        raw_data: Readonly<TypeSpecs.Buffer>;
    };
    raw_data: Buffer;
    constructor();
    static createEmpty(): ServerKeyExchange;
}
export declare class ServerKeyExchange_PSK extends TLSStruct {
    psk_identity_hint: Vector<number>;
    static readonly __spec: {
        psk_identity_hint: TypeSpecs.Vector;
    };
    static readonly spec: TypeSpecs.Struct;
    constructor(psk_identity_hint: Vector<number>);
    static createEmpty(): ServerKeyExchange_PSK;
}
export declare class ClientKeyExchange extends Handshake {
    static readonly __spec: {
        raw_data: Readonly<TypeSpecs.Buffer>;
    };
    raw_data: Buffer;
    constructor();
    static createEmpty(): ClientKeyExchange;
}
export declare class ClientKeyExchange_PSK extends TLSStruct {
    psk_identity: Vector<number>;
    static readonly __spec: {
        psk_identity: TypeSpecs.Vector;
    };
    static readonly spec: TypeSpecs.Struct;
    constructor(psk_identity: Vector<number>);
    static createEmpty(): ClientKeyExchange_PSK;
}
export declare class ServerHelloDone extends Handshake {
    static readonly __spec: {};
    constructor();
    static createEmpty(): ServerHelloDone;
}
export declare class Finished extends Handshake {
    verify_data: Buffer;
    static readonly __spec: {
        verify_data: Readonly<TypeSpecs.Buffer>;
    };
    constructor(verify_data: Buffer);
    static createEmpty(): Finished;
}
export declare const HandshakeMessages: {
    [type: number]: {
        __spec: any;
    };
};
