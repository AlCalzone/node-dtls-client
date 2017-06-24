﻿import * as TypeSpecs from "../TLS/TypeSpecs";
import { TLSStruct } from "../TLS/TLSStruct";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { ContentType } from "../TLS/ContentType";
import { DTLSCompressed } from "./DTLSCompressed";
import { CipherDelegate, DecipherDelegate, MACDelegate } from "../TLS/CipherSuite";

export class DTLSCiphertext extends TLSStruct {

	static readonly __spec = {
		type: ContentType.__spec,
		version: TypeSpecs.define.Struct(ProtocolVersion),
		epoch: TypeSpecs.uint16,
		sequence_number: TypeSpecs.uint48,
		// length field is implied in the variable length vector //length: new TypeSpecs.Calculated("uint16", "serializedLength", "fragment"),
		fragment: TypeSpecs.define.Vector(TypeSpecs.uint8, 0, 2048 + 2 ** 14)
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
	 * @param outgoingMac - The MAC function used for outgoing packets
	 */
	static encrypt(packet: DTLSCompressed, cipher: CipherDelegate, outgoingMac: MACDelegate): DTLSCiphertext {

		// compute the MAC for this packet
		const MAC = outgoingMac(
			Buffer.concat([
				packet.computeMACHeader(),
				packet.fragment
			])
		);

		// combine that with the MAC to form the plaintext and encrypt it
		const plaintext = Buffer.concat([
			packet.fragment,
			MAC
		]);
		const ciphertext = cipher(plaintext);

		return new DTLSCiphertext(
			packet.type,
			packet.version,
			packet.epoch,
			packet.sequence_number,
			ciphertext
		);
	}
	
	/**
	 * Decrypts this packet into a compressed packet
	 * @param decipher - The decipher used to decrypt this packet
	 * @param incomingMac - The MAC function used for incoming packets
	 */
	decrypt(decipher: DecipherDelegate, incomingMac: MACDelegate): DTLSCompressed {

		const decipherResult = decipher(this.fragment);
		if (decipherResult.err) {
			// calculate fake MAC to prevent a timing attack
			incomingMac(decipherResult.result);
			// now throw the error
			throw decipherResult.err;
		}

		// split the plaintext into content and MAC
		const plaintext = decipherResult.result;
		const content = plaintext.slice(0, -incomingMac.length);
		const receivedMAC = plaintext.slice(-incomingMac.length);

		// Create the compressed packet
		const ret = new DTLSCompressed(
			this.type,
			this.version,
			this.epoch,
			this.sequence_number,
			content
		);

		// compute the expected MAC for this packet
		const expectedMAC = incomingMac(
			Buffer.concat([
				ret.computeMACHeader(),
				ret.fragment
			])
		);

		// and check if it matches the actual one
		if (!expectedMAC.equals(receivedMAC)) {
			throw new Error("invalid MAC detected in DTLS packet");
		}

		return ret;
	}
}


