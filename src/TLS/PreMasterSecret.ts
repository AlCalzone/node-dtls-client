import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";

export class PreMasterSecret extends TLSStruct {

	static readonly __spec = {
		other_secret: new TLSTypes.Vector("uint8", 0, 2 ** 16 - 1),
		psk: new TLSTypes.Vector("uint8", 0, 2 ** 16 - 1)
	}

	constructor(
		public other_secret: number[],
		public psk: number[]
	) {
		super(PreMasterSecret.__spec);
	}

}