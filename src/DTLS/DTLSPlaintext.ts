﻿import { ContentType } from "../TLS/ContentType";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { TLSStruct } from "../TLS/TLSStruct";
import * as TypeSpecs from "../TLS/TypeSpecs";
import { DTLSPacket } from "./DTLSPacket";

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
