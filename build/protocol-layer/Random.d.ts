import * as TLSTypes from "../lib/TLSTypes";
import { TLSStruct } from "../lib/TLSStruct";
export declare class Random extends TLSStruct {
    static readonly __spec: {
        gmt_unix_time: string;
        random_bytes: TLSTypes.Vector;
    };
    constructor();
}
