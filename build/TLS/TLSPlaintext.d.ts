/// <reference types="node" />
import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import { ProtocolVersion } from "./ProtocolVersion";
import { ContentType } from "./ContentType";
export declare class TLSPlaintext extends TLSStruct {
    type: ContentType;
    version: ProtocolVersion;
    fragment: Buffer;
    static readonly __spec: {
        type: TLSTypes.Enum;
        version: {
            major: string;
            minor: string;
        };
        length: TLSTypes.Calculated;
        fragment: TLSTypes.Vector;
    };
    constructor(type: ContentType, version: ProtocolVersion, fragment: Buffer);
}
