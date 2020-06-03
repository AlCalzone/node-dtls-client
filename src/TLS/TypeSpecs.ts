// tslint:disable:ban-types
import { ISerializableConstructor } from "./Serializable";

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
	[propName: string]: All;
}
export interface Struct {
	type: "struct";
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
export namespace Vector {
	export function isVariableLength(spec: Vector): boolean {
		return spec.maxLength !== spec.minLength;
	}
}

/** Unparsed raw data */
export interface Buffer {
	type: "buffer";
	minLength: number;
	maxLength: number;
}
export namespace Buffer {
	export function isVariableLength(spec: Buffer): boolean {
		return spec.maxLength !== spec.minLength;
	}
}

export type All = Complex | Vector | Buffer;

// Shortcuts:
export const define = {
	Enum: (size: Numbers, enumType: any): Enum => ({ type: "enum", size, enumType }),
	Number: (size: Numbers): Number => ({ type: "number", size }),
	Struct: (structType: any): Struct => ({
		type: "struct",
		structType: (structType as ISerializableConstructor),
	}),
	Vector: (itemSpec: Complex, minLength = 0, maxLength = minLength, optional = false): Vector => ({
		type: "vector",
		itemSpec,
		minLength, maxLength,
		optional,
	}),
	Buffer: (minLength = Number.POSITIVE_INFINITY, maxLength = minLength): Buffer => ({
		type: "buffer",
		minLength, maxLength,
	}),
};
export const uint8 = Object.freeze(define.Number("uint8"));
export const uint16 = Object.freeze(define.Number("uint16"));
export const uint24 = Object.freeze(define.Number("uint24"));
export const uint32 = Object.freeze(define.Number("uint32"));
export const uint48 = Object.freeze(define.Number("uint48"));
export const uint64 = Object.freeze(define.Number("uint64"));
