import * as crypto from "crypto";
import { GenericCipherDelegate, GenericDecipherDelegate, GenericMacDelegate, KeyMaterial } from "./CipherSuite";
import { ConnectionEnd } from "./ConnectionState";
import { DTLSCompressed } from "../DTLS/DTLSCompressed";
import { DTLSCiphertext } from "../DTLS/DTLSCiphertext";

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
	const cipherParams = AEADCipherParameters[algorithm];
	const ret = ((packet: DTLSCompressed, keyMaterial: KeyMaterial, connEnd: ConnectionEnd) => {
		const plaintext = packet.fragment;

		// find the right encryption params
		const record_iv = crypto.pseudoRandomBytes(cipherParams.blockSize);
		const cipher_key = (connEnd === "server") ? keyMaterial.server_write_key : keyMaterial.client_write_key;
		const cipher = crypto.createCipheriv(algorithm, cipher_key, record_iv);
		cipher.setAutoPadding(false);

		// encrypt the plaintext
		const ciphertext = Buffer.concat([
			cipher.update(plaintext),
			cipher.final()
		]);

		// prepend it with the iv
		const fragment = Buffer.concat([
			record_iv,
			ciphertext
		]);

		// and return the packet
		return new DTLSCiphertext(
			packet.type,
			packet.version,
			packet.epoch,
			packet.sequence_number,
			fragment
		);
	}) as AEADCipherDelegate;
	// append key length information
	ret.keyLength = cipherParams.keyLength;
	ret.blockSize = cipherParams.blockSize;
	ret.authTagLength = cipherParams.authTagLength;
	//ret.nonceLength = cipherParams.nonceLength;
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
	const decipherParams = AEADCipherParameters[algorithm];
	const ret = ((packet: DTLSCiphertext, keyMaterial: KeyMaterial, connEnd: ConnectionEnd) => {
		const ciphertext = packet.fragment;
		
		// find the right decryption params
		const record_iv = ciphertext.slice(0, decipherParams.blockSize);
		const decipher_key = (connEnd === "client") ? keyMaterial.server_write_key : keyMaterial.client_write_key;
		const decipher = crypto.createDecipheriv(algorithm, decipher_key, record_iv);
		decipher.setAutoPadding(false);

		// decrypt the ciphertext
		const ciphered = ciphertext.slice(decipherParams.blockSize);
		const deciphered = Buffer.concat([
			decipher.update(ciphered),
			decipher.final()
		]);

		const plaintext = Buffer.from(
			deciphered//.slice(0, -1 - paddingLength)
		);

		return new DTLSCompressed(
			packet.type,
			packet.version,
			packet.epoch,
			packet.sequence_number,
			plaintext
		);
	}) as AEADDecipherDelegate;

	// append key length information
	ret.keyLength = decipherParams.keyLength;
	ret.blockSize = decipherParams.blockSize;
	ret.authTagLength = decipherParams.authTagLength;
	//ret.nonceLength = decipherParams.nonceLength;
	return ret;
}


