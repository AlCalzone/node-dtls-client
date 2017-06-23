/// <reference types="node" />
import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
export declare class PreMasterSecret extends TLSStruct {
    other_secret: Buffer;
    psk: Buffer;
    static readonly __spec: {
        other_secret: TypeSpecs.Vector;
        psk: TypeSpecs.Vector;
    };
    constructor(other_secret: Buffer, psk: Buffer);
}
