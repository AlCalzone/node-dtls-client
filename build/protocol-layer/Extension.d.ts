import * as TLSTypes from "../lib/TLSTypes";
import { TLSStruct } from "../lib/TLSStruct";
export default class Extension extends TLSStruct {
    extension_type: ExtensionType;
    extension_data: number[];
    static readonly __spec: {
        extension_type: TLSTypes.Enum;
        extension_data: TLSTypes.Vector;
    };
    constructor(extension_type: ExtensionType, extension_data: number[]);
}
export declare enum ExtensionType {
    signature_algorithms = 13,
}
