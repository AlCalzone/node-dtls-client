/// <reference types="node" />
import * as TLSTypes from "../TLS/TLSTypes";
import { TLSStruct } from "../TLS/TLSStruct";
import { SessionID } from "../TLS/SessionID";
import { Cookie } from "./Cookie";
import { CipherSuite } from "../TLS/CipherSuite";
import { CompressionMethod } from "../TLS/ConnectionState";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
export declare abstract class Handshake extends TLSStruct {
    msg_type: HandshakeType;
    constructor(msg_type: HandshakeType, bodySpec: TLSTypes.StructSpec, initial?: any);
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
    fragment: Buffer;
    static readonly __spec: {
        msg_type: TLSTypes.Enum;
        total_length: string;
        message_seq: string;
        fragment_offset: string;
        fragment: TLSTypes.Vector;
    };
    /**
     * The amount of data consumed by a handshake message header (without the actual fragment)
     */
    static readonly headerLength: number;
    constructor(msg_type: HandshakeType, total_length: number, message_seq: number, fragment_offset: number, fragment: Buffer);
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
     * Checks if the provided handshake fragments form a complete message
     */
    static isComplete(fragments: FragmentedHandshake[]): boolean;
    /**
     * Reassembles a series of fragmented handshake messages into a complete one.
     * Warning: doesn't check for validity, do that in advance!
     */
    static reassemble(messages: FragmentedHandshake[]): FragmentedHandshake;
}
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
export declare const HandshakeMessages: {};
export declare class HelloRequest extends Handshake {
    static readonly __spec: {};
    constructor();
}
export declare class ClientHello extends Handshake {
    static readonly __spec: {
        client_version: {
            major: string;
            minor: string;
        };
        random: {
            gmt_unix_time: string;
            random_bytes: TLSTypes.Vector;
        };
        session_id: {
            value: TLSTypes.Vector;
        };
        cookie: {
            value: TLSTypes.Vector;
        };
    };
    static readonly __bodySpecWithExtensions: any;
    client_version: ProtocolVersion;
    session_id: SessionID;
    cookie: Cookie;
    extensions: any;
    constructor(initial?: any);
}
export declare class ServerHello extends Handshake {
    static readonly __spec: {
        server_version: {
            major: string;
            minor: string;
        };
        random: {
            gmt_unix_time: string;
            random_bytes: TLSTypes.Vector;
        };
        session_id: {
            value: TLSTypes.Vector;
        };
        cipher_suite: {
            id: string;
        };
        compression_method: TLSTypes.Enum;
    };
    static readonly __bodySpecWithExtensions: any;
    server_version: ProtocolVersion;
    session_id: SessionID;
    cipher_suite: CipherSuite;
    compression_method: CompressionMethod;
    extensions: any;
    constructor(initial?: any);
}
export declare class HelloVerifyRequest extends Handshake {
    static readonly __spec: {
        server_version: {
            major: string;
            minor: string;
        };
        cookie: {
            value: TLSTypes.Vector;
        };
    };
    server_version: ProtocolVersion;
    cookie: Cookie;
    constructor(initial?: any);
}
export declare class ServerHelloDone extends Handshake {
    static readonly __spec: {};
    constructor();
}
export declare class Finished extends Handshake {
    static readonly __spec: {
        verify_data: TLSTypes.Vector;
    };
    verify_data: Buffer;
    constructor(initial?: any);
}
