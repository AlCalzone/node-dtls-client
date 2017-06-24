import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
export declare class Random extends TLSStruct {
    static readonly __spec: {
        gmt_unix_time: Readonly<TypeSpecs.Number>;
        random_bytes: TypeSpecs.Vector;
    };
    constructor();
}
