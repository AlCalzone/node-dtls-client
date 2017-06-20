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
    body: TLSStruct;
    constructor(msg_type: HandshakeType, bodySpec: TLSTypes.StructSpec, body?: TLSStruct);
    message_seq: number;
    /**
     * Fragments this packet into a series of packets according to the configured MTU
     */
    fragmentMessage(): FragmentedHandshake[];
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
    constructor(msg_type: HandshakeType, total_length: number, message_seq: number, fragment_offset: number, fragment: Buffer);
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
export declare class HelloRequest extends Handshake {
    static readonly __bodySpec: {};
    constructor();
}
export declare class ClientHello extends Handshake {
    client_version: ProtocolVersion;
    session_id: SessionID;
    cookie: Cookie;
    extensions: any;
    static readonly __bodySpec: {
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
    constructor(client_version: ProtocolVersion, session_id: SessionID, cookie: Cookie, extensions?: any);
}
export declare class ServerHello extends Handshake {
    server_version: ProtocolVersion;
    session_id: SessionID;
    cipher_suite: CipherSuite;
    compression_method: CompressionMethod;
    extensions: any;
    static readonly __bodySpec: {
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
    constructor(server_version: ProtocolVersion, session_id: SessionID, cipher_suite: CipherSuite, compression_method: CompressionMethod, extensions?: any);
}
export declare class HelloVerifyRequest extends Handshake {
    server_version: ProtocolVersion;
    cookie: Cookie;
    static readonly __bodySpec: {
        server_version: {
            major: string;
            minor: string;
        };
        cookie: {
            value: TLSTypes.Vector;
        };
    };
    constructor(server_version: ProtocolVersion, cookie: Cookie);
}
export declare class ServerHelloDone extends Handshake {
    static readonly __bodySpec: {};
    constructor();
}
export declare class Finished extends Handshake {
    verify_data: Buffer;
    static readonly __bodySpec: {
        verify_data: TLSTypes.Vector;
    };
    constructor(verify_data: Buffer);
}
