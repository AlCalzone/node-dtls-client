import * as crypto from "crypto";
import { TLSStruct } from "./TLSStruct";
import * as TypeSpecs from "./TypeSpecs";

export class Random extends TLSStruct {

	public static readonly __spec = {
		gmt_unix_time: TypeSpecs.uint32,
		random_bytes: TypeSpecs.define.Buffer(28),
	};

	constructor(
		public gmt_unix_time: number,
		public random_bytes: Buffer,
	) {
		super(Random.__spec);
	}

	/**
	 * Creates a new Random structure and initializes it.
	 */
	public static createNew(): Random {
		return new Random(
			Math.floor(Date.now() / 1000),
			crypto.randomBytes(Random.__spec.random_bytes.maxLength),
		);
	}

	public static createEmpty(): Random {
		return new Random(null, null);
	}

}
