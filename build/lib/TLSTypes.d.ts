export declare type Numbers = "uint8" | "uint16" | "uint24" | "uint32" | "uint64";
export declare class Enum {
    underlyingType: Numbers;
    enumType: any;
    constructor(underlyingType: Numbers, enumType: any);
}
export declare class Vector {
    underlyingType: Numbers;
    minLength: number;
    maxLength: number;
    constructor(underlyingType: Numbers, minLength: number, maxLength: number);
}
export declare type StructSpec = {
    [propName: string]: All;
};
export declare class Struct {
    spec: StructSpec;
    constructor(spec: StructSpec);
}
export declare type All = Numbers | Enum | Vector | Struct;
