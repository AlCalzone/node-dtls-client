import * as TLSTypes from "../lib/TLSTypes";
import { TLSStruct } from "../lib/TLSStruct";
export declare class CipherSuite extends TLSStruct {
    value: number[];
    static readonly __spec: {
        value: TLSTypes.Vector;
    };
    constructor(value?: number[]);
}
