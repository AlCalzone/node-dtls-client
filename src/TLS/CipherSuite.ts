import * as crypto from "crypto";
import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import { ConnectionState, ConnectionEnd, KeyMaterial } from "./ConnectionState";
import { extend } from "../lib/object-polyfill";

export type PRFAlgorithm =
	"md5" |
	"sha1" | "sha256" | "sha384" | "sha512"
	;

export type CipherType = 
	"stream" | "block" | "aead"
	;

export type MACAlgorithm = 
	"md5" |
	"sha1" | "sha256" | "sha384" | "sha512"
	;

export type KeyExchangeAlgorithm =
	"dhe_dss" | "dhe_rsa" |
	// forbidden: dh_anon, 
	"rsa" | "dh_dss" | "dh_rsa" |
	"psk" | "dhe_psk" | "rsa_psk"// Server/Client|KeyExchange: see https://tools.ietf.org/html/rfc4279#page-4
	;

export type BlockCipherAlgorithm = 
	"aes-128-cbc" | "aes-256-cbc" |
	"des-ede3-cbc"
	;

interface BlockCipherParameter {
	keyLength: number,
	blockSize: number
}
/**
 * The length of encryption keys and block size for each algorithm in bytes
 */
const BlockCipherParameters: {
	[algorithm in BlockCipherAlgorithm]?: BlockCipherParameter
} = {
		"aes-128-cbc": { keyLength: 16, blockSize: 16 },
		"aes-256-cbc": { keyLength: 16, blockSize: 16 },
		"des-ede3-cbc": { keyLength: 24, blockSize: 16 },
	};

export enum AEADAlgorithm {
	// ...
	// from https://tools.ietf.org/html/rfc5116#section-6
	AES_128_CCM     = 3,
	AES_256_CCM     = 4,	
	// ...
	// from https://tools.ietf.org/html/rfc6655#section-6
	AES_128_CCM_8     = 18,
	AES_256_CCM_8     = 19,
}

	
/**
 * The length of MAC keys for each algorithm in bytes
 */
const MACKeyLengths: {
	[algorithm in MACAlgorithm]?: number
} = {
		md5: 16,
		sha1: 20,
		sha256: 32,
		sha384: 48,
		sha512: 64
	};

export type CipherDelegate = (plaintext: Buffer) => Buffer;
export type DecipherDelegate = (ciphertext: Buffer) => Buffer;

function createNullCipher() {
	return (plaintext) => Buffer.from(plaintext);
}

/**
 * Creates a block cipher delegate used to encrypt packet fragments.
 * @param entity - Denotes if the current entity is the server or client
 * @param algorithm - The block cipher algorithm to be used
 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the encryption
 */
function createBlockCipher(
	entity: ConnectionEnd,
	algorithm: BlockCipherAlgorithm, 
	keyMaterial: KeyMaterial,
	
) : CipherDelegate {
	const keyLengths = BlockCipherParameters[algorithm];
	return (plaintext: Buffer): Buffer => {
		// figure out how much padding we need
		const overflow = ((plaintext.length + 1) % keyLengths.blockSize);
		const padLength = (overflow > 0) ? (keyLengths.blockSize - overflow) : 0;
		const padding = Buffer.alloc(padLength + 1, /*fill=*/padLength); // one byte is the actual length of the padding array
		
		// find the right encryption params
		const record_iv = crypto.pseudoRandomBytes(keyLengths.blockSize);
		const cipher_key = (entity === "client") ? keyMaterial.server_write_key : keyMaterial.client_write_key ;
		const cipher = crypto.createCipheriv(algorithm, cipher_key, record_iv);
		
		// encrypt the plaintext
		cipher.write(plaintext);
		cipher.write(buffer);
		cipher.end();
		
		// prepend it with the iv
		return Buffer.concat([
			Buffer.from(record_iv),
			cipher.read()
		]);
	}
}

/**
 * Creates a block cipher delegate used to decrypt packet fragments.
 * @param entity - Denotes if the current entity is the server or client
 * @param algorithm - The block cipher algorithm to be used
 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the decryption
 */
function createBlockDecipher(
	entity: ConnectionEnd,
	algorithm: BlockCipherAlgorithm, 
	keyMaterial: KeyMaterial
) : DecipherDelegate {
	const keyLengths = BlockCipherParameters[algorithm];
	return (plaintext: Buffer): Buffer => {
		// TODO
	}
}

export class CipherSuite extends TLSStruct {

	static readonly __spec = {
		id: "uint16"
	}

	constructor(
		public id: number,
		public keyExchange: KeyExchangeAlgorithm,
		public mac: MACAlgorithm,
		public prf: PRFAlgorithm,
		public cipherType: CipherType,
		public algorithm?: (BlockCipherAlgorithm | AEADAlgorithm)
	) {
		super(CipherSuite.__spec);

		// // Initialwerte für Schlüssellängen etc. merken
		// switch (this.cipherType) {
			// case "block":
				// this.keyLengths = extend(
					// BlockCipherParameters[algorithm as BlockCipherAlgorithm],
					// { macLength: MACKeyLengths[mac] }
				// );
				// break;
		// }
	}

	// public readonly keyLengths: {
		// keyLength: number,
		// blockSize: number,
		// macLength: number
	// }
	
	getCipher(keyMaterial: KeyMaterial) : CipherDelegate {
		switch (this.cipherType) {
			case null:
				return createNullCipher();
			case "block":
				return createBlockCipher(
					this.algorithm as BlockCipherAlgorithm,
					this.mac,
					keyMaterial
				);
		}
	}
	getDecipher(keyMaterial: KeyMaterial) : DecipherDelegate {
		switch (this.cipherType) {
			case null:
				return createNullCipher();
			case "block":
				return createBlockDecipher(
					this.algorithm as BlockCipherAlgorithm,
					this.mac,
					keyMaterial
				);
		}
	}

}