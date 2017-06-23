import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
export declare class SessionID extends TLSStruct {
    value: any[];
    static readonly __spec: {
        value: TypeSpecs.Vector;
    };
    constructor(value?: any[]);
}
