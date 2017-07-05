import * as crypto from "crypto";
import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
import { Vector } from "../TLS/Vector";

//function getRandomArray(length: number): number[] {
//	const random = crypto.randomBytes(length);
//	return Array.prototype.slice.apply(random);
//}

export class Random extends TLSStruct {

	static readonly __spec = {
		gmt_unix_time: TypeSpecs.uint32,
		random_bytes: TypeSpecs.define.Buffer(28,28)
	}

	constructor(
		public gmt_unix_time: number,
		public random_bytes: Buffer
	) {
		super(Random.__spec);
	}

	/**
	 * Creates a new Random structure and initializes it.
	 */
	static createNew(): Random {
		return new Random(
			Math.floor(Date.now() / 1000),
			crypto.randomBytes(Random.__spec.random_bytes.maxLength)
		);
	}

	static createEmpty(): Random {
		return new Random(null, null);
	}	

}