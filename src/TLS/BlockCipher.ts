import * as crypto from "crypto";
import { CipherDelegate, DecipherDelegate, MACDelegate, KeyMaterial } from "./CipherSuite";
import { ConnectionEnd } from "./ConnectionState";

export type BlockCipherAlgorithm =
	"aes-128-cbc" | "aes-256-cbc" |
	"des-ede3-cbc"
	;

interface BlockCipherParameter {
	keyLength: number,
	blockSize: number
}

const BlockCipherParameters: { [algorithm in BlockCipherAlgorithm]?: BlockCipherParameter } = {
	"aes-128-cbc": { keyLength: 16, blockSize: 16 },
	"aes-256-cbc": { keyLength: 16, blockSize: 16 },
	"des-ede3-cbc": { keyLength: 24, blockSize: 16 },
};

/**
 * Creates a block cipher delegate used to encrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 * @param connEnd - Denotes if the current entity is the server or client
 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the encryption
 */
export function createCipher(
	algorithm: BlockCipherAlgorithm,
	connEnd: ConnectionEnd, 
	keyMaterial: KeyMaterial,
	): CipherDelegate
{
	const keyLengths = BlockCipherParameters[algorithm];
	/**
	 * @param plaintext - The plaintext to be encrypted
	 */
	return (plaintext: Buffer) => {
		// figure out how much padding we need
		const overflow = ((plaintext.length + 1) % keyLengths.blockSize);
		const padLength = (overflow > 0) ? (keyLengths.blockSize - overflow) : 0;
		const padding = Buffer.alloc(padLength + 1, /*fill=*/padLength); // one byte is the actual length of the padding array

		// find the right encryption params
		const record_iv = crypto.pseudoRandomBytes(keyLengths.blockSize);
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
	}
}

/**
 * Creates a block cipher delegate used to decrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 * @param connEnd - Denotes if the current entity is the server or client
 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the decryption
 */
export function createDecipher(
	algorithm: BlockCipherAlgorithm,
	connEnd: ConnectionEnd, 
	keyMaterial: KeyMaterial
	): DecipherDelegate
{
	const keyLengths = BlockCipherParameters[algorithm];
	/**
	 * @param ciphertext - The ciphertext to be decrypted
	 */
	return (ciphertext: Buffer) => {
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
	}
}


