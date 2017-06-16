import * as TLSTypes from "../TLS/TLSTypes";
import { TLSStruct } from "../TLS/TLSStruct";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { ContentType } from "../TLS/ContentType";
export declare class DTLSCiphertext extends TLSStruct {
    type: ContentType;
    version: ProtocolVersion;
    epoch: number;
    sequence_number: number;
    fragment: number[];
    static readonly __spec: {
        type: TLSTypes.Enum;
        version: {
            major: string;
            minor: string;
        };
        epoch: string;
        sequence_number: string;
        length: TLSTypes.Calculated;
        fragment: TLSTypes.Vector;
    };
    constructor(type: ContentType, version: ProtocolVersion, epoch: number, sequence_number: number, fragment: number[]);
}
