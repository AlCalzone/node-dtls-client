import * as crypto from "crypto";
import { GenericCipherDelegate, GenericDecipherDelegate, GenericMacDelegate, KeyMaterial } from "./CipherSuite";
import { ConnectionEnd } from "./ConnectionState";

export type BlockCipherAlgorithm =
	"aes-128-cbc" | "aes-256-cbc" |
	"des-ede3-cbc"
	;

export interface BlockCipherDelegate extends GenericCipherDelegate {
	/**
	 * The block size of this algorithm
	 */
	blockSize: number;
}
export interface BlockDecipherDelegate extends GenericDecipherDelegate {
	/**
	 * The block size of this algorithm
	 */
	blockSize: number;
}

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
 */
export function createCipher(
	algorithm: BlockCipherAlgorithm, 
): BlockCipherDelegate
{
	const keyLengths = BlockCipherParameters[algorithm];
	const ret = ((plaintext: Buffer, keyMaterial: KeyMaterial, connEnd: ConnectionEnd) => {
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
	}) as BlockCipherDelegate;
	// append key length information
	ret.keyLength = keyLengths.keyLength;
	ret.recordIvLength = ret.blockSize = keyLengths.blockSize;
	return ret;
}

/**
 * Creates a block cipher delegate used to decrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 */
export function createDecipher(
	algorithm: BlockCipherAlgorithm,
): BlockDecipherDelegate
{
	const keyLengths = BlockCipherParameters[algorithm];
	const ret = ((ciphertext: Buffer, keyMaterial: KeyMaterial, connEnd: ConnectionEnd) => {
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
	}) as BlockDecipherDelegate;

	// append key length information
	ret.keyLength = keyLengths.keyLength;
	ret.recordIvLength = ret.blockSize = keyLengths.blockSize;
	return ret;
}


