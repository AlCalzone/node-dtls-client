import * as TypeSpecs from "../TLS/TypeSpecs";
import { TLSStruct } from "../TLS/TLSStruct";

export class Cookie extends TLSStruct {

	static readonly __spec = {
		value: TypeSpecs.define.Vector(TypeSpecs.uint8, 0, 2**8-1)
	}

	constructor(public value = []) {
		super(Cookie.__spec);
	}

}