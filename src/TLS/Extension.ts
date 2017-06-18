import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";

export default class Extension extends TLSStruct {

	static readonly __spec = {
		extension_type: ExtensionType.__spec,
		extension_data: new TLSTypes.Vector("uint8", 0, 2**16 - 1)
	}

	constructor(public extension_type: ExtensionType, public extension_data: Buffer) {
		super(Extension.__spec);
	}
}


export enum ExtensionType {
	signature_algorithms = 13
};
export namespace ExtensionType {
	export const __spec = new TLSTypes.Enum("uint16", ExtensionType);
}
