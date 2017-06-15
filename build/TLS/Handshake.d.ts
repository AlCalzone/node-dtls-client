import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import { SessionID } from "./SessionID";
import { CipherSuite } from "./CipherSuite";
import { CompressionMethod } from "./CompressionMethod";
import { ProtocolVersion } from "./ProtocolVersion";
export declare abstract class Handshake extends TLSStruct {
    msg_type: HandshakeType;
    static readonly __spec: {
        msg_type: TLSTypes.Enum;
        length: TLSTypes.Calculated;
    };
    constructor(msg_type: HandshakeType, bodySpec: TLSTypes.StructSpec, initial?: any);
    body: TLSStruct;
    readonly length: number;
}
export declare enum HandshakeType {
    hello_request = 0,
    client_hello = 1,
    server_hello = 2,
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
    };
    static readonly __bodySpecWithExtensions: any;
    constructor(client_version: ProtocolVersion, session_id?: SessionID, extensions?: any);
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
            value: TLSTypes.Vector;
        };
        compression_method: TLSTypes.Enum;
    };
    static readonly __bodySpecWithExtensions: any;
    constructor(server_version: ProtocolVersion, session_id: SessionID, cipher_suite: CipherSuite, compression_method: CompressionMethod, extensions?: any);
}
export declare class ServerHelloDone extends Handshake {
    static readonly __bodySpec: {};
    constructor();
}
export declare class Finished extends Handshake {
    verify_data: number[];
    static readonly __bodySpec: {
        verify_data: TLSTypes.Vector;
    };
    constructor(verify_data: number[]);
}
