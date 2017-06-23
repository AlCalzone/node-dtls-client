import * as TypeSpecs from "../TLS/TypeSpecs";
import { TLSStruct } from "../TLS/TLSStruct";
export declare class Cookie extends TLSStruct {
    value: any[];
    static readonly __spec: {
        value: TypeSpecs.Vector;
    };
    constructor(value?: any[]);
}
