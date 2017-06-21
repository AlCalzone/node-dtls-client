export declare type Numbers = "uint8" | "uint16" | "uint24" | "uint32" | "uint64";
export declare class Enum {
    underlyingType: Numbers;
    enumType: any;
    constructor(underlyingType: Numbers, enumType: any);
}
export declare class Vector {
    constructor(underlyingType: any, minLength: any, maxLength?: any, optional?: boolean);
    underlyingType: Numbers;
    minLength: number;
    maxLength: number;
    optional: boolean;
}
export interface StructSpec {
    [propName: string]: any;
}
export declare class Struct {
    spec: StructSpec;
    constructor(spec: StructSpec);
}
export declare type All = Numbers | Enum | Vector | Struct;
