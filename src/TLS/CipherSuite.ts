import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";

export type CipherSuiteID = [number, number];

export class CipherSuite extends TLSStruct {

	static readonly __spec = {
		value: new TLSTypes.Vector("uint8", 2)
	}

	constructor(public value: CipherSuiteID = [0,0]) {
		super(CipherSuite.__spec);
	}

}