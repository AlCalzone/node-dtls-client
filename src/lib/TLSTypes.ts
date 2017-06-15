export type Numbers =
	"uint8" |
	"uint16" |
	"uint24" |
	"uint32" |
	"uint64"
	;

export class Enum {
	constructor(
		public underlyingType: Numbers,
		public enumType: any
	) { }
}

export class Vector {
	constructor(
		underlyingType,
		minLength,
		maxLength?
	) { 
		this.underlyingType = underlyingType;
		this.minLength = minLength;
		this.maxLength = maxLength || minLength;
	}

	underlyingType: Numbers
	minLength: number
	maxLength: number
}

export type StructSpec = {
	[propName: string]: any
};
export class Struct {
	constructor(
		public spec: StructSpec
	) { }
}

export type CalculationTypes = "serializedLength";
export class Calculated {
	constructor(
		public underlyingType: Numbers,
		public calculationType: CalculationTypes,
		public propertyName: string
	) { }
}

export type All = Numbers | Enum | Vector | Struct | Calculated