import * as TLSTypes from "../lib/TLSTypes";
import { TLSStruct } from "../lib/TLSStruct";

export class CipherSuite extends TLSStruct {

	static readonly __spec = {
		value: new TLSTypes.Vector("uint8", 2)
	}

	constructor(public value = [0,0]) {
		super(CipherSuite.__spec);
	}

}