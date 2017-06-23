/// <reference types="node" />
import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
export declare enum ExtensionType {
    signature_algorithms = 13,
}
export declare namespace ExtensionType {
    const __spec: TypeSpecs.Enum;
}
export default class Extension extends TLSStruct {
    extension_type: ExtensionType;
    extension_data: Buffer;
    static readonly __spec: {
        extension_type: TypeSpecs.Enum;
        extension_data: TypeSpecs.Vector;
    };
    constructor(extension_type: ExtensionType, extension_data: Buffer);
}
