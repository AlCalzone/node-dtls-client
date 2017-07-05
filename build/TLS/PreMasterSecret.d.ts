/// <reference types="node" />
import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
export declare class PreMasterSecret extends TLSStruct {
    other_secret: Buffer;
    psk: Buffer;
    static readonly __spec: {
        other_secret: TypeSpecs.Buffer;
        psk: TypeSpecs.Buffer;
    };
    constructor(other_secret: Buffer, psk: Buffer);
    static createEmpty(): PreMasterSecret;
}
