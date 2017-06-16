import * as TLSTypes from "../TLS/TLSTypes";
import { TLSStruct } from "../TLS/TLSStruct";
export declare class Cookie extends TLSStruct {
    value: any[];
    static readonly __spec: {
        value: TLSTypes.Vector;
    };
    constructor(value?: any[]);
}
