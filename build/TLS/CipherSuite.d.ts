import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
export declare class CipherSuite extends TLSStruct {
    value: number[];
    static readonly __spec: {
        value: TLSTypes.Vector;
    };
    constructor(value?: number[]);
}
