/// <reference types="node" />
import { TLSStruct } from "../TLS/TLSStruct";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { ContentType } from "../TLS/ContentType";
export declare class DTLSPlaintext extends TLSStruct {
    type: ContentType;
    version: ProtocolVersion;
    epoch: number;
    sequence_number: number;
    fragment: Buffer;
    static readonly __spec: {
        type: any;
        version: {
            major: string;
            minor: string;
        };
        epoch: string;
        sequence_number: string;
        fragment: any;
    };
    constructor(type: ContentType, version: ProtocolVersion, epoch: number, sequence_number: number, fragment: Buffer);
}
