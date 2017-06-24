﻿import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";

export enum ExtensionType {
	signature_algorithms = 13
};
export namespace ExtensionType {
	export const __spec = TypeSpecs.define.Enum("uint16", ExtensionType);
}


export default class Extension extends TLSStruct {

	static readonly __spec = {
		extension_type: ExtensionType.__spec,
		extension_data: TypeSpecs.define.Vector(TypeSpecs.uint8, 0, 2**16 - 1)
	}

	constructor(public extension_type: ExtensionType, public extension_data: Buffer) {
		super(Extension.__spec);
	}
}