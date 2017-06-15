import * as TLSTypes from "../lib/TLSTypes";
import { TLSStruct } from "../lib/TLSStruct";

export class Random extends TLSStruct {

	static readonly __spec = {
		gmt_unix_time: "uint32",
		random_bytes: new TLSTypes.Vector("uint8", 28)
	}

	constructor() {
		super(Random.__spec);
	}

}