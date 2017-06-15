import * as TLSTypes from "../lib/TLSTypes";
import { TLSStruct } from "../lib/TLSStruct";
import { ProtocolVersion } from "./ProtocolVersion";
import { ContentType } from "./ContentType";

export class TLSPlaintext extends TLSStruct {

	static readonly __spec = {
		type: ContentType.__spec,
		version: ProtocolVersion.__spec,
		length: "uint16",
		fragment: new TLSTypes.Vector("uint8", 0, 2**14)
	};

	constructor(
		public type: ContentType,
		public version = new ProtocolVersion(),
		public fragment: number[]
	) {
		super(TLSPlaintext.__spec);
	}

	get length() { return this.fragment.length; }

}