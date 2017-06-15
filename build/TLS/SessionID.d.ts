import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
export declare class SessionID extends TLSStruct {
    value: any[];
    static readonly __spec: {
        value: TLSTypes.Vector;
    };
    constructor(value?: any[]);
}
