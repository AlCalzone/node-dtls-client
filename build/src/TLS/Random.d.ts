import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
import { Vector } from "../TLS/Vector";
export declare class Random extends TLSStruct {
    gmt_unix_time: number;
    random_bytes: Vector<number>;
    static readonly __spec: {
        gmt_unix_time: Readonly<TypeSpecs.Number>;
        random_bytes: TypeSpecs.Vector;
    };
    constructor(gmt_unix_time: number, random_bytes: Vector<number>);
    /**
     * Creates a new Random structure and initializes it.
     */
    static createNew(): Random;
    static createEmpty(): Random;
}
