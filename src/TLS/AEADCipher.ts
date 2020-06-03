import * as crypto from "crypto";
import { DTLSCiphertext } from "../DTLS/DTLSCiphertext";
import { DTLSCompressed } from "../DTLS/DTLSCompressed";
import { AEADEncryptionInterface, ccm, gcm } from "../lib/AEADCrypto";
import { ContentType } from "../TLS/ContentType";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { GenericCipherDelegate, GenericDecipherDelegate, KeyMaterial } from "./CipherSuite";
import { ConnectionEnd } from "./ConnectionState";
import { TLSStruct } from "./TLSStruct";
import * as TypeSpecs from "./TypeSpecs";


export type AEADCipherAlgorithm =
	"aes-128-ccm" | "aes-256-ccm" |
	"aes-128-ccm8" | "aes-256-ccm8" |
	"aes-128-gcm" | "aes-256-gcm"
	;

export interface AEADCipherDelegate extends GenericCipherDelegate {
	/**
	 * The length of nonces for each record
	 */
	nonceLength: number;
	/**
	 * The block size of this algorithm
	 */
	blockSize: number;
	/**
	 * The length of the authentication tag in bytes.
	 */
	authTagLength: number;
}
export interface AEADDecipherDelegate extends GenericDecipherDelegate {
	/**
	 * The length of nonces for each record
	 */
	nonceLength: number;
	/**
	 * The block size of this algorithm
	 */
	blockSize: number;
	/**
	 * The length of the authentication tag in bytes.
	 */
	authTagLength: number;
}

interface AEADCipherParameter {
	interface: AEADEncryptionInterface;
	keyLength: number;
	blockSize: number;
	authTagLength: number;
	fixedIvLength: number;
	recordIvLength: number;
}

const AEADCipherParameters: {[algorithm in AEADCipherAlgorithm]?: AEADCipherParameter } = {
	"aes-128-ccm":  { interface: ccm, keyLength: 16, blockSize: 16, fixedIvLength: 4, recordIvLength: 8, authTagLength: 16 },
	"aes-128-ccm8": { interface: ccm, keyLength: 16, blockSize: 16, fixedIvLength: 4, recordIvLength: 8, authTagLength: 8 },
	"aes-256-ccm":  { interface: ccm, keyLength: 32, blockSize: 16, fixedIvLength: 4, recordIvLength: 8, authTagLength: 16 },
	"aes-256-ccm8": { interface: ccm, keyLength: 32, blockSize: 16, fixedIvLength: 4, recordIvLength: 8, authTagLength: 8 },
	"aes-128-gcm":  { interface: gcm, keyLength: 16, blockSize: 16, fixedIvLength: 4, recordIvLength: 8, authTagLength: 16 },
	"aes-256-gcm":  { interface: gcm, keyLength: 32, blockSize: 16, fixedIvLength: 4, recordIvLength: 8, authTagLength: 16 },
};

class AdditionalData extends TLSStruct {

	public static readonly __spec = {
		epoch: TypeSpecs.uint16, // the seq_num in the specs refers to the TLS seq_num, which is 64 bits!
		sequence_number: TypeSpecs.uint48,
		type: ContentType.__spec,
		version: TypeSpecs.define.Struct(ProtocolVersion),
		fragment_length: TypeSpecs.uint16,
	};

	constructor(
		public epoch: number,
		public sequence_number: number,
		public type: ContentType,
		public version: ProtocolVersion,
		public fragment_length: number,
	) {
		super(AdditionalData.__spec);
	}

	public static createEmpty(): AdditionalData {
		return new AdditionalData(null, null, null, null, null);
	}

}

/**
 * Creates an AEAD cipher delegate used to encrypt packet fragments.
 * @param algorithm - The AEAD cipher algorithm to be used
 */
export function createCipher(
	algorithm: AEADCipherAlgorithm,
): AEADCipherDelegate {

	const cipherParams = AEADCipherParameters[algorithm];
	const ret = ((packet: DTLSCompressed, keyMaterial: KeyMaterial, connEnd: ConnectionEnd) => {
		const plaintext = packet.fragment;

		// find the right encryption params
		const salt = (connEnd === "server") ? keyMaterial.server_write_IV : keyMaterial.client_write_IV;
		const nonce_explicit = crypto.pseudoRandomBytes(cipherParams.recordIvLength);
		// alternatively:
		// const nonce_explicit = Buffer.concat([
		// 	BitConverter.numberToBuffer(packet.epoch, 16),
		// 	BitConverter.numberToBuffer(packet.sequence_number, 48)
		// ]);
		const nonce = Buffer.concat([salt, nonce_explicit]);
		const additionalData = new AdditionalData(
			packet.epoch,
			packet.sequence_number,
			packet.type,
			packet.version,
			packet.fragment.length,
		).serialize();
		const cipher_key = (connEnd === "server") ? keyMaterial.server_write_key : keyMaterial.client_write_key;

		// Find the right function to encrypt
		const encrypt = cipherParams.interface.encrypt;

		// encrypt and concat the neccessary pieces
		const encryptionResult = encrypt(cipher_key, nonce, plaintext, additionalData, cipherParams.authTagLength);
		const fragment = Buffer.concat([
			nonce_explicit,
			encryptionResult.ciphertext,
			encryptionResult.auth_tag,
		]);

		// and return the packet
		return new DTLSCiphertext(
			packet.type,
			packet.version,
			packet.epoch,
			packet.sequence_number,
			fragment,
		);

	}) as AEADCipherDelegate;
	// append key length information
	ret.keyLength = cipherParams.keyLength;
	ret.blockSize = cipherParams.blockSize;
	ret.authTagLength = cipherParams.authTagLength;
	ret.fixedIvLength = cipherParams.fixedIvLength;
	ret.recordIvLength = cipherParams.recordIvLength;

	return ret;
}

/**
 * Creates an AEAD cipher delegate used to decrypt packet fragments.
 * @param algorithm - The AEAD cipher algorithm to be used
 */
export function createDecipher(
	algorithm: AEADCipherAlgorithm,
): AEADDecipherDelegate {

	const decipherParams = AEADCipherParameters[algorithm];
	const ret = ((packet: DTLSCiphertext, keyMaterial: KeyMaterial, connEnd: ConnectionEnd) => {
		const ciphertext = packet.fragment;
		const sourceConnEnd: ConnectionEnd = (connEnd === "client") ? "server" : "client";

		// find the right decryption params
		const salt = (sourceConnEnd === "server") ? keyMaterial.server_write_IV : keyMaterial.client_write_IV;
		const nonce_explicit = ciphertext.slice(0, decipherParams.recordIvLength);
		const nonce = Buffer.concat([salt, nonce_explicit]);

		const additionalData = new AdditionalData(
			packet.epoch,
			packet.sequence_number,
			packet.type,
			packet.version,
			// subtract the AEAD overhead from the packet length for authentication
			packet.fragment.length - decipherParams.recordIvLength - decipherParams.authTagLength,
		).serialize();

		const authTag = ciphertext.slice(-decipherParams.authTagLength);

		const decipher_key = (sourceConnEnd === "server") ? keyMaterial.server_write_key : keyMaterial.client_write_key;

		// Find the right function to decrypt
		const decrypt = decipherParams.interface.decrypt;

		// decrypt the ciphertext and check the result
		const ciphered = ciphertext.slice(decipherParams.recordIvLength, -decipherParams.authTagLength);
		const decryptionResult = decrypt(decipher_key, nonce, ciphered, additionalData, authTag);

		if (!decryptionResult.auth_ok) {
			throw new Error("Authenticated decryption of the packet failed.");
		}

		// everything good, return the decrypted packet
		return new DTLSCompressed(
			packet.type,
			packet.version,
			packet.epoch,
			packet.sequence_number,
			decryptionResult.plaintext,
		);

	}) as AEADDecipherDelegate;

	// append key length information
	ret.keyLength = decipherParams.keyLength;
	ret.blockSize = decipherParams.blockSize;
	ret.authTagLength = decipherParams.authTagLength;
	ret.fixedIvLength = decipherParams.fixedIvLength;
	ret.recordIvLength = decipherParams.recordIvLength;

	return ret;
}
