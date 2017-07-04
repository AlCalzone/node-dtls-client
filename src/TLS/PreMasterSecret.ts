import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
import { Vector } from "./Vector";

export class PreMasterSecret extends TLSStruct {

	static readonly __spec = {
		other_secret: TypeSpecs.define.Vector(TypeSpecs.uint8, 0, 2 ** 16 - 1),
		psk: TypeSpecs.define.Vector(TypeSpecs.uint8, 0, 2 ** 16 - 1)
	}

	constructor(
		public other_secret: Vector<number>,
		public psk: Vector<number>
	) {
		super(PreMasterSecret.__spec);

		if (this.other_secret == null) {
			// create fake contents
			this.other_secret = Vector.createFromBuffer(Buffer.alloc(this.psk.items.length, 0));
		}
	}

	static createEmpty(): PreMasterSecret {
		return new PreMasterSecret(null, null);
	}

}