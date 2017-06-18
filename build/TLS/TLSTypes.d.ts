export declare type Numbers = "uint8" | "uint16" | "uint24" | "uint32" | "uint64";
export declare class Enum {
    underlyingType: Numbers;
    enumType: any;
    constructor(underlyingType: Numbers, enumType: any);
}
export declare class Vector {
    constructor(underlyingType: any, minLength: any, maxLength?: any);
    underlyingType: Numbers;
    minLength: number;
    maxLength: number;
}
export declare type StructSpec = {
    [propName: string]: any;
};
export declare class Struct {
    spec: StructSpec;
    constructor(spec: StructSpec);
}
export declare type CalculationTypes = "serializedLength";
export declare class Calculated {
    underlyingType: Numbers;
    calculationType: CalculationTypes;
    propertyName: string;
    constructor(underlyingType: Numbers, calculationType: CalculationTypes, propertyName: string);
}
export declare type All = Numbers | Enum | Vector | Struct | Calculated;
