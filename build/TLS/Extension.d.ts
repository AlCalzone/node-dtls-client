/// <reference types="node" />
import { TLSStruct } from "./TLSStruct";
export declare enum ExtensionType {
    signature_algorithms = 13,
}
export declare namespace ExtensionType {
    const __spec: any;
}
export default class Extension extends TLSStruct {
    extension_type: ExtensionType;
    extension_data: Buffer;
    static readonly __spec: {
        extension_type: any;
        extension_data: any;
    };
    constructor(extension_type: ExtensionType, extension_data: Buffer);
}
