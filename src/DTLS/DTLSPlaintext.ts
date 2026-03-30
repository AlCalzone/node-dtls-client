import { ContentType } from "../TLS/ContentType.js";
import { ProtocolVersion } from "../TLS/ProtocolVersion.js";
import { TLSStruct } from "../TLS/TLSStruct.js";
import * as TypeSpecs from "../TLS/TypeSpecs.js";
import { DTLSPacket } from "./DTLSPacket.js";

export class DTLSPlaintext extends TLSStruct implements DTLSPacket {

	public static readonly __spec = {
		type: TypeSpecs.define.Struct(ContentType),
		version: TypeSpecs.define.Struct(ProtocolVersion),
		epoch: TypeSpecs.uint16,
		sequence_number: TypeSpecs.uint48,
		// length field is implied in the variable length vector
		fragment: TypeSpecs.define.Buffer(0, 2 ** 14),
	};
	public static readonly spec = TypeSpecs.define.Struct(DTLSPlaintext);

	constructor(
		public type: ContentType,
		public version = new ProtocolVersion(),
		public epoch: number,
		public sequence_number: number,
		public fragment: Buffer,
	) {
		super(DTLSPlaintext.__spec);
	}

	public static createEmpty(): DTLSPlaintext {
		return new DTLSPlaintext(null, null, null, null, null);
	}

}
