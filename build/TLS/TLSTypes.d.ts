export declare type Numbers = "uint8" | "uint16" | "uint24" | "uint32" | "uint64";
export interface Number {
    type: "number";
    size: Numbers;
}
export interface Enum {
    type: "enum";
    size: Numbers;
    enumType: any;
}
export declare type Primitive = Number | Enum;
export interface StructSpec {
    [propName: string]: any;
}
export interface Struct {
    type: "struct";
    spec: StructSpec;
}
export declare type Complex = Primitive | Struct;
export interface Vector {
    type: "vector";
    itemType: Complex;
    minLength: number;
    maxLength: number;
    optional: boolean;
}
export declare type All = Complex | Vector;
export declare const make: {
    ["enum"]: (size: Numbers, enumType: any) => {
        type: string;
        size: Numbers;
        enumType: any;
    };
    number: (size: Numbers) => {
        type: string;
        size: Numbers;
    };
    struct: (spec: StructSpec) => {
        type: string;
        spec: StructSpec;
    };
    vector: (itemType: Complex, minLength?: number, maxLength?: number, optional?: boolean) => {
        type: string;
        itemType: Complex;
        minLength: number;
        maxLength: number;
        optional: boolean;
    };
};
