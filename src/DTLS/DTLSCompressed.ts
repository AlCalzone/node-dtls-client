import * as TLSTypes from "../TLS/TLSTypes";
import { TLSStruct } from "../TLS/TLSStruct";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { ContentType } from "../TLS/ContentType";

export class DTLSCompressed extends TLSStruct {

	static readonly __spec = {
		type: ContentType.__spec,
		version: ProtocolVersion.__spec,
		epoch: "uint16",
		sequence_number: "uint48",
		length: new TLSTypes.Calculated("uint16", "serializedLength", "fragment"),
		fragment: new TLSTypes.Vector("uint8", 0, 1024 + 2 ** 14)
	};

	constructor(
		public type: ContentType,
		public version = new ProtocolVersion(),
		public epoch: number,
		public sequence_number: number,
		public fragment: number[]
	) {
		super(DTLSCompressed.__spec);
	}

	//get length() { return this.fragment.length; }

}