import * as crypto from "crypto";
import { GenericCipherDelegate, GenericDecipherDelegate, GenericMacDelegate, KeyMaterial } from "./CipherSuite";
import { ConnectionEnd } from "./ConnectionState";
import { DTLSPacket } from "../DTLS/DTLSPacket";

/* see
https://tools.ietf.org/html/rfc5246#section-6.2.3.3
http://lollyrock.com/articles/nodejs-encryption/

*/

export type AEADCipherAlgorithm =
	"aes-128-ccm" | "aes-256-ccm" |
	"aes-128-ccm8" | "aes-256-ccm8" |
	"aes-128-gcm" | "aes-256-gcm" |
	"aes-128-gcm8" | "aes-256-gcm8"
	;


export interface AEADCipherDelegate {
	/**
	 * Encrypts the given plaintext packet
	 * @param plaintext - The plaintext to be encrypted
	 * @param keyMaterial - The key material (mac and encryption keys) used in the encryption
	 * @param connEnd - Denotes if the current entity is the server or client
	 */
	(plaintext: DTLSPacket, keyMaterial: KeyMaterial, connEnd: ConnectionEnd): Buffer;

	/**
	 * The length of encryption keys in bytes
	 */
	keyLength: number;

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
export interface AEADDecipherDelegate {
	/**
	 * Decrypts the given ciphered packet
	 * @param ciphertext - The ciphertext to be decrypted
	 * @param keyMaterial - The key material (mac and encryption keys) used in the decryption
	 * @param connEnd - Denotes if the current entity is the server or client
	 */
	(ciphertext: DTLSPacket, keyMaterial: KeyMaterial, connEnd: ConnectionEnd): { err?: Error, result: Buffer };

	/**
	 * The length of decryption keys in bytes
	 */
	keyLength: number;

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
	keyLength: number,
	blockSize: number,
	authTagLength: number
}

const AEADCipherParameters: {[algorithm in AEADCipherAlgorithm]?: AEADCipherParameter } = {
	"aes-128-ccm": { keyLength: 16, blockSize: 16, authTagLength: 16 },
	"aes-128-ccm8": { keyLength: 16, blockSize: 16, authTagLength: 8 },
	"aes-256-ccm": { keyLength: 16, blockSize: 32, authTagLength: 16 },
	"aes-256-ccm8": { keyLength: 16, blockSize: 32, authTagLength: 8 },
	"aes-128-gcm": { keyLength: 16, blockSize: 16, authTagLength: 16 },
	"aes-128-gcm8": { keyLength: 16, blockSize: 16, authTagLength: 8 },
	"aes-256-gcm": { keyLength: 16, blockSize: 32, authTagLength: 16 },
	"aes-256-gcm8": { keyLength: 16, blockSize: 32, authTagLength: 8 }
};

/**
 * Creates an AEAD cipher delegate used to encrypt packet fragments.
 * @param algorithm - The AEAD cipher algorithm to be used
 */
export function createCipher(
	algorithm: AEADCipherAlgorithm, 
): AEADCipherDelegate
{
	const params = AEADCipherParameters[algorithm];
	const ret = ((packet: DTLSPacket, keyMaterial: KeyMaterial, connEnd: ConnectionEnd) => {
		const plaintext = packet.fragment;
		// figure out how much padding we need
		const overflow = ((plaintext.length + 1) % params.blockSize);
		const padLength = (overflow > 0) ? (params.blockSize - overflow) : 0;
		const padding = Buffer.alloc(padLength + 1, /*fill=*/padLength); // one byte is the actual length of the padding array

		// find the right encryption params
		const record_iv = crypto.pseudoRandomBytes(params.blockSize);
		const cipher_key = (connEnd === "server") ? keyMaterial.server_write_key : keyMaterial.client_write_key;
		const cipher = crypto.createCipheriv(algorithm, cipher_key, record_iv);
		cipher.setAutoPadding(false);

		// encrypt the plaintext
		const ciphertext = Buffer.concat([
			cipher.update(plaintext),
			cipher.update(padding),
			cipher.final()
		]);

		// prepend it with the iv
		return Buffer.concat([
			record_iv,
			ciphertext
		]);
	}) as AEADCipherDelegate;
	// append key length information
	ret.keyLength = params.keyLength;
	ret.recordIvLength = ret.blockSize = params.blockSize;
	return ret;
}

/**
 * Creates an AEAD cipher delegate used to decrypt packet fragments.
 * @param algorithm - The AEAD cipher algorithm to be used
 */
export function createDecipher(
	algorithm: AEADCipherAlgorithm,
): AEADDecipherDelegate
{
	const keyLengths = BlockCipherParameters[algorithm];
	const ret = ((packet: DTLSPacket, keyMaterial: KeyMaterial, connEnd: ConnectionEnd) => {
		const ciphertext = packet.fragment;
		// find the right decryption params
		const record_iv = ciphertext.slice(0, keyLengths.blockSize);
		const decipher_key = (connEnd === "client") ? keyMaterial.server_write_key : keyMaterial.client_write_key;
		const decipher = crypto.createDecipheriv(algorithm, decipher_key, record_iv);
		decipher.setAutoPadding(false);

		// decrypt the ciphertext
		const ciphered = ciphertext.slice(keyLengths.blockSize);
		const deciphered = Buffer.concat([
			decipher.update(ciphered),
			decipher.final()
		]);

		function invalidMAC() {
			// Even if we have an error, still return some plaintext.
			// This allows to prevent a CBC timing attack
			return {
				err: new Error("invalid MAC detected in DTLS packet"),
				result: deciphered
			};
		}

		// check the padding
		const len = deciphered.length;
		if (len === 0) return invalidMAC(); // no data
		const paddingLength = deciphered[len - 1];
		if (len < paddingLength) throw invalidMAC(); // not enough data
		for (let i = 1; i <= paddingLength; i++) {
			// wrong values in padding
			if (deciphered[len - 1 - i] !== paddingLength) throw invalidMAC();
		}

		// strip off padding
		const plaintext = Buffer.from(
			deciphered.slice(0, -1 - paddingLength)
		);

		// contains fragment + MAC
		return { result: plaintext };
	}) as AEADDecipherDelegate;

	// append key length information
	ret.keyLength = keyLengths.keyLength;
	ret.recordIvLength = ret.blockSize = keyLengths.blockSize;
	return ret;
}


