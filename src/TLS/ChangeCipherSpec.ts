import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";

export default class ChangeCipherSpec extends TLSStruct {

	static readonly __spec = {
		type: new TLSTypes.Enum("uint8", ChangeCipherSpec)
	}

	constructor(public type: ChangeCipherSpecTypes) {
		super(ChangeCipherSpec.__spec);
	}
}


export enum ChangeCipherSpecTypes {
	change_cipher_spec = 1
};
export namespace ChangeCipherSpecTypes {
	export const __spec = new TLSTypes.Enum("uint8", ChangeCipherSpecTypes);
}
