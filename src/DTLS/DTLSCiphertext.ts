import * as TypeSpecs from "../TLS/TypeSpecs";
import { TLSStruct } from "../TLS/TLSStruct";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { ContentType } from "../TLS/ContentType";
import { DTLSCompressed } from "./DTLSCompressed";
import { CipherDelegate, DecipherDelegate/*, MacDelegate*/ } from "../TLS/CipherSuite";
import { ISerializableConstructor, ISerializable } from "../TLS/Serializable";
import { DTLSPacket } from "./DTLSPacket";

export class DTLSCiphertext extends TLSStruct implements DTLSPacket {

	static readonly __spec = {
		type: ContentType.__spec,
		version: TypeSpecs.define.Struct(ProtocolVersion),
		epoch: TypeSpecs.uint16,
		sequence_number: TypeSpecs.uint48,
		// length field is implied in the variable length vector
		fragment: TypeSpecs.define.Buffer(0, 2048 + 2 ** 14)
	};
	static readonly spec = TypeSpecs.define.Struct(DTLSCiphertext);

	constructor(
		public type: ContentType,
		public version = new ProtocolVersion(),
		public epoch: number,
		public sequence_number: number,
		public fragment: Buffer // <XXX>Ciphertext
	) {
		super(DTLSCiphertext.__spec);
	}

	static createEmpty(): DTLSCiphertext {
		return new DTLSCiphertext(null, null, null, null, null);
	}

}


