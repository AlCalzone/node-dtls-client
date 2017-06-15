import * as TLSTypes from "../lib/TLSTypes";
import { TLSStruct } from "../lib/TLSStruct";
export declare class SessionID extends TLSStruct {
    value: any[];
    static readonly __spec: {
        value: TLSTypes.Vector;
    };
    constructor(value?: any[]);
}
