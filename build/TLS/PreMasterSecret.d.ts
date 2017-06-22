/// <reference types="node" />
import { TLSStruct } from "./TLSStruct";
export declare class PreMasterSecret extends TLSStruct {
    other_secret: Buffer;
    psk: Buffer;
    static readonly __spec: {
        other_secret: any;
        psk: any;
    };
    constructor(other_secret: Buffer, psk: Buffer);
}
