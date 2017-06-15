import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";

export class CipherSuite extends TLSStruct {

	static readonly __spec = {
		value: new TLSTypes.Vector("uint8", 2)
	}

	constructor(public value = [0,0]) {
		super(CipherSuite.__spec);
	}

}