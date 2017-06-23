import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";

export class Random extends TLSStruct {

	static readonly __spec = {
		gmt_unix_time: TypeSpecs.define.Number("uint32"),
		random_bytes: TypeSpecs.define.Vector(TypeSpecs.define.Number("uint8"), 28)
	}

	constructor() {
		super(Random.__spec);
	}

}