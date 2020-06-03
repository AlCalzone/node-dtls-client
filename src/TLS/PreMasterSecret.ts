import { TLSStruct } from "./TLSStruct";
import * as TypeSpecs from "./TypeSpecs";

export class PreMasterSecret extends TLSStruct {

	public static readonly __spec = {
		other_secret: TypeSpecs.define.Buffer(0, 2 ** 16 - 1),
		psk: TypeSpecs.define.Buffer(0, 2 ** 16 - 1),
	};

	constructor(
		public other_secret: Buffer,
		public psk: Buffer,
	) {
		super(PreMasterSecret.__spec);

		if (this.other_secret == null) {
			// create fake contents
			this.other_secret = Buffer.alloc(this.psk.length, 0);
		}
	}

	public static createEmpty(): PreMasterSecret {
		return new PreMasterSecret(null, null);
	}

}
