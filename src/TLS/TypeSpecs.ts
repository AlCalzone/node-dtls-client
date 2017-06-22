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
export interface Struct {
	type: "struct";
	spec: StructSpec;
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
export const make = {
	["enum"]: (size: Numbers, enumType: any) => ({ type: "enum", size, enumType }),
	number: (size: Numbers) => ({ type: "number", size }),
	struct: (spec: StructSpec) => ({ type: "struct", spec }),
	vector: (itemType: Complex, minLength = 0, maxLength = minLength, optional = false) => ({
		type: "vector",
		itemType,
		minLength, maxLength,
		optional
	}),
};
