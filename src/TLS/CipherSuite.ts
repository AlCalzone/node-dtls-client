import * as crypto from "crypto";
import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
import { ConnectionState, ConnectionEnd } from "./ConnectionState";
import { KeyExchangeAlgorithm } from "./KeyExchange";
import * as BlockCipher from "./BlockCipher";
import { HMAC } from "./PRF";
import { extend } from "../lib/object-polyfill";

export type HashAlgorithm =
	"md5" |
	"sha1" | "sha256" | "sha384" | "sha512"
	;

export type CipherType = 
	"stream" | "block" | "aead"
	;

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
 * Creates a block cipher delegate used to encrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 * @param sourceConnEnd - Denotes which connection end the packet is coming from
 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the encryption
 */
export function createMAC(
	algorithm: HashAlgorithm,
	sourceConnEnd: ConnectionEnd,
	keyMaterial: KeyMaterial,
): MACDelegate {

	// find the right hash params
	const mac_key = (sourceConnEnd === "server") ? keyMaterial.server_write_MAC_key : keyMaterial.client_write_MAC_key;
	//const keyLength = MACKeyLengths[algorithm];
	const MAC = HMAC[algorithm];

	const ret = ((data) => MAC(mac_key, data)) as MACDelegate;
	ret.length = MAC.length;
	return ret;
}

export type CipherDelegate = (plaintext: Buffer) => Buffer;
export type DecipherDelegate = (ciphertext: Buffer) => { err?: Error, result: Buffer };
export interface MACDelegate {
	/**
	 * Generates a MAC hash from the given data using the underlying HMAC function.
	 * @param data - The data to be hashed
	 */
	(data: Buffer): Buffer;
	/**
	 * The key and hash output length of this hash function
	 */
	length: number;
}

export interface KeyMaterial {
	client_write_MAC_key: Buffer /*ConnectionState.mac_key_length*/;
	server_write_MAC_key: Buffer /*ConnectionState.mac_key_length*/;
	client_write_key: Buffer /*ConnectionState.enc_key_length*/;
	server_write_key: Buffer /*ConnectionState.enc_key_length*/;
	client_write_IV: Buffer /*ConnectionState.fixed_iv_length*/;
	server_write_IV: Buffer /*ConnectionState.fixed_iv_length*/;
}


function createNullCipher(): CipherDelegate {
	return (plaintext) => Buffer.from(plaintext);
}
function createNullDecipher(): DecipherDelegate {
	return (ciphertext) => ({ result: Buffer.from(ciphertext) });
}
function createNullMAC(): MACDelegate {
	const ret = ((data) => Buffer.from(data)) as MACDelegate;
	ret.length = 0;
	return ret;
}

export class CipherSuite extends TLSStruct {

	static readonly __spec = {
		id: TypeSpecs.uint16
	}

	constructor(
		public id: number,
		public keyExchange: KeyExchangeAlgorithm,
		public mac: HashAlgorithm,
		public prf: HashAlgorithm,
		public cipherType: CipherType,
		public algorithm?: (BlockCipher.BlockCipherAlgorithm | AEADAlgorithm)
	) {
		super(CipherSuite.__spec);
	}
	
	createCipher(connEnd: ConnectionEnd, keyMaterial: KeyMaterial) : CipherDelegate {
		switch (this.cipherType) {
			case null:
				return createNullCipher();
			case "block":
				return BlockCipher.createCipher(
					this.algorithm as BlockCipher.BlockCipherAlgorithm,
					connEnd,
					keyMaterial
				);
		}
	}
	createDecipher(connEnd: ConnectionEnd, keyMaterial: KeyMaterial) : DecipherDelegate {
		switch (this.cipherType) {
			case null:
				return createNullDecipher();
			case "block":
				return BlockCipher.createDecipher(
					this.algorithm as BlockCipher.BlockCipherAlgorithm,
					connEnd,
					keyMaterial
				);
		}
	}
	createMAC(sourceConnEnd: ConnectionEnd, keyMaterial: KeyMaterial): MACDelegate {
		// TODO: detect special cases
		switch (this.cipherType) {
			case null:
				return createNullMAC();
			case "stream":
			case "block":
				if (this.mac == null)
					return createNullMAC();
				return createMAC(this.mac, sourceConnEnd, keyMaterial);
		}
	}

}