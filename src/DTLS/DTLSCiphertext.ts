import * as TLSTypes from "../TLS/TLSTypes";
import { TLSStruct } from "../TLS/TLSStruct";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { ContentType } from "../TLS/ContentType";
import { DTLSCompressed } from "./DTLSCompressed";

export class DTLSCiphertext extends TLSStruct {

	static readonly __spec = {
		type: ContentType.__spec,
		version: ProtocolVersion.__spec,
		epoch: "uint16",
		sequence_number: "uint48",
		length: new TLSTypes.Calculated("uint16", "serializedLength", "fragment"),
		fragment: new TLSTypes.Vector("uint8", 0, 2048 + 2 ** 14)
	};

	constructor(
		public type: ContentType,
		public version = new ProtocolVersion(),
		public epoch: number,
		public sequence_number: number,
		public fragment: Buffer // <XXX>Ciphertext
	) {
		super(DTLSCiphertext.__spec);
	}


	/**
	 * Encrypts the given compressed packet
	 * @param packet - The packet to be encrypted
	 * @param cipher - The cipher used to encrypt the given packet
	 */
	static encrypt(packet: DTLSCompressed, cipher: CipherDelegate) : DTLSCiphertext {
		return new DTLSCiphertext(
			packet.type,
			packet.version,
			packet.epoch,
			packet.sequence_number,
			cipher(packet.fragment)
		);
	}
	
	/**
	 * Decrypts this packet into a compressed packet
	 * @param decipher - The decipher used to decrypt this packet
	 */
	decompress(decipher: DecipherDelegate) : DTLSCompressed {
		return new DTLSCompressed(
			this.type,
			this.version,
			this.epoch,
			this.sequence_number,
			decipher(this.fragment) // TODO: handle decryption errors (like too large fragments)
		);
	}
}


export type CipherDelegate = (plaintext: Buffer) => Buffer;
export type DecipherDelegate = (ciphertext: Buffer) => Buffer;