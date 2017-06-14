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
		public underlyingType: Numbers,
		public minLength: number,
		public maxLength: number
	) { }
}

export type StructSpec = {
	[propName: string]: All
};
export class Struct {
	constructor(
		public spec: StructSpec
	) { }
}

export type All = Numbers | Enum | Vector | Struct