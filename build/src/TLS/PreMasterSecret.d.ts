import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
import { Vector } from "./Vector";
export declare class PreMasterSecret extends TLSStruct {
    other_secret: Vector<number>;
    psk: Vector<number>;
    static readonly __spec: {
        other_secret: TypeSpecs.Vector;
        psk: TypeSpecs.Vector;
    };
    constructor(other_secret: Vector<number>, psk: Vector<number>);
    static createEmpty(): PreMasterSecret;
}
