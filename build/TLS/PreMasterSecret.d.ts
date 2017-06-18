/// <reference types="node" />
import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
export declare class PreMasterSecret extends TLSStruct {
    other_secret: Buffer;
    psk: Buffer;
    static readonly __spec: {
        other_secret: TLSTypes.Vector;
        psk: TLSTypes.Vector;
    };
    constructor(other_secret: Buffer, psk: Buffer);
}
