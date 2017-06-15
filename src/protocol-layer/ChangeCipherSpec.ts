import * as TLSTypes from "../lib/TLSTypes";
import { TLSStruct } from "../lib/TLSStruct";

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