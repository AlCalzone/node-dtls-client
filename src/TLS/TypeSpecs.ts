import { ISerializable, ISerializableConstructor } from "./Serializable";
import { applyMixins } from "../lib/Mixins";

export type Numbers =
	"uint8" |
	"uint16" |
	"uint24" |
	"uint32" |
	"uint48" | // DTLS
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
export function getPrimitiveSize(spec: Primitive): number {
	return +(spec as Primitive).size.substr("uint".length);
}
export interface IStruct extends ISerializableConstructor {
	readonly __spec: StructSpec;
}
export interface StructSpec {
	[propName: string]: All
}
export interface Struct {
	type: "struct";
	spec: StructSpec;
	structType: ISerializableConstructor;
}

export type Complex = Primitive | Struct;

export interface Vector {
	type: "vector";
	itemSpec: Complex;
	minLength: number;
	maxLength: number;
	optional: boolean;
}

var test: Struct;

export type All = Complex | Vector;

// Shortcuts:
export const define = {
	Enum: (size: Numbers, enumType: any): Enum => ({ type: "enum", size, enumType }),
	Number: (size: Numbers): Number => ({ type: "number", size }),
	Struct: (structType: any): Struct => ({
		type: "struct",
		spec: (structType as any as IStruct).__spec, // require this property, we don't want to repeat us that much
		structType: (structType as ISerializableConstructor)
	}),
	Vector: (itemSpec: Complex, minLength = 0, maxLength = minLength, optional = false): Vector => ({
		type: "vector",
		itemSpec,
		minLength, maxLength,
		optional
	}),
};