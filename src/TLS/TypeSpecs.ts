import { Serializable } from "./Serializable";
import { applyMixins } from "../lib/Mixins";

export type Numbers =
	"uint8" |
	"uint16" |
	"uint24" |
	"uint32" |
	"uint64"
	;

export interface Number {
	type: "number";
	size: Numbers;
}

export interface Enum {
	type: "enum";
	size: Numbers;
	enumType: any;
}

export type Primitive = Number | Enum;

export interface StructSpec {
	[propName: string]: any
}
export interface Struct<T implements Serializable<T>> {
	type: "struct";
	spec: StructSpec;
	structType: T;
}

export type Complex = Primitive | Struct;

export interface Vector {
	type: "vector";
	itemType: Complex;
	minLength: number;
	maxLength: number;
	optional: boolean;
}

export type All = Complex | Vector;

// Shortcuts:
export const define = {
	Enum: (size: Numbers, enumType: any) => ({ type: "enum", size, enumType }),
	Number: (size: Numbers) => ({ type: "number", size }),
	Struct: (spec: StructSpec, structType) => ({ type: "struct", spec, structType }),
	Vector: (itemType: Complex, minLength = 0, maxLength = minLength, optional = false) => ({
		type: "vector",
		itemType,
		minLength, maxLength,
		optional
	}),
};
