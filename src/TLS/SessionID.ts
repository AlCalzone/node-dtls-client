import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";

export class SessionID extends TLSStruct {

	static readonly __spec = {
		value: TypeSpecs.define.Vector(TypeSpecs.uint8, 0, 32)
	}

	constructor(public value = []) {
		super(SessionID.__spec);
	}

}