import * as TLSTypes from "../TLS/TLSTypes";
import { TLSStruct } from "../TLS/TLSStruct";

export class Cookie extends TLSStruct {

	static readonly __spec = {
		value: new TLSTypes.Vector("uint8", 0, 2**8-1)
	}

	constructor(public value = []) {
		super(Cookie.__spec);
	}

}