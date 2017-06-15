import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import { ProtocolVersion } from "./ProtocolVersion";
import { ContentType } from "./ContentType";

export class TLSCompressed extends TLSStruct {

	static readonly __spec = {
		type: ContentType.__spec,
		version: ProtocolVersion.__spec,
		length: "uint16",
		fragment: new TLSTypes.Vector("uint8", 0, 1024 + 2 ** 14)
	};

	constructor(
		public type: ContentType,
		public version = new ProtocolVersion(),
		public fragment: number[]
	) {
		super(TLSCompressed.__spec);
	}

	get length() { return this.fragment.length; }

}