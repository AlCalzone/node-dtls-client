import * as TLSTypes from "../lib/TLSTypes";
import { TLSStruct } from "../lib/TLSStruct";

export class SessionID extends TLSStruct {

	static readonly __spec = {
		value: new TLSTypes.Vector("uint8", 0, 32)
	}

	constructor(public value = []) {
		super(SessionID.__spec);
	}

}