import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";

export class PreMasterSecret extends TLSStruct {

	static readonly __spec = {
		other_secret: TypeSpecs.define.Vector(TypeSpecs.uint8, 0, 2 ** 16 - 1),
		psk: TypeSpecs.define.Vector(TypeSpecs.uint8, 0, 2 ** 16 - 1)
	}

	constructor(
		public other_secret: Buffer,
		public psk: Buffer
	) {
		super(PreMasterSecret.__spec);
	}

}