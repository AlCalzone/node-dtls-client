/// <reference types="node" />
import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
export declare enum ExtensionType {
    signature_algorithms = 13,
}
export declare namespace ExtensionType {
    const spec: TypeSpecs.Enum;
}
export declare class Extension extends TLSStruct {
    extension_type: ExtensionType;
    extension_data: Buffer;
    static readonly __spec: {
        extension_type: TypeSpecs.Enum;
        extension_data: TypeSpecs.Vector;
    };
    static readonly spec: TypeSpecs.Struct;
    constructor(extension_type: ExtensionType, extension_data: Buffer);
    static createEmpty(): Extension;
}
