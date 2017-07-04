import * as TypeSpecs from "../TLS/TypeSpecs";
import { TLSStruct } from "../TLS/TLSStruct";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { ContentType } from "../TLS/ContentType";

export class DTLSPlaintext extends TLSStruct {

	static readonly __spec = {
		type: TypeSpecs.define.Struct(ContentType),
		version: TypeSpecs.define.Struct(ProtocolVersion),
		epoch: TypeSpecs.uint16,
		sequence_number: TypeSpecs.uint48,
		// length field is implied in the variable length vector //length: new TypeSpecs.Calculated("uint16", "serializedLength", "fragment"),
		fragment: TypeSpecs.define.Vector(TypeSpecs.uint8, 0, 2**14)
	};
	static readonly spec = TypeSpecs.define.Struct(DTLSPlaintext);

	constructor(
		public type: ContentType,
		public version = new ProtocolVersion(),
		public epoch: number,
		public sequence_number: number,
		public fragment: Buffer
	) {
		super(DTLSPlaintext.__spec);
	}

	static createEmpty(): DTLSPlaintext {
		return new DTLSPlaintext(null, null, null, null, null);
	}

}