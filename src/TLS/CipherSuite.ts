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
 */
export function createMAC(
	algorithm: HashAlgorithm
): GenericMacDelegate {

	//const keyLength = MACKeyLengths[algorithm];
	const MAC = HMAC[algorithm];

	const ret = ((data: Buffer, keyMaterial: KeyMaterial, sourceConnEnd: ConnectionEnd) => {
		// find the right hash params
		const mac_key = (sourceConnEnd === "server") ? keyMaterial.server_write_MAC_key : keyMaterial.client_write_MAC_key;
		// and return the hash
		return MAC(mac_key, data);
	}) as GenericMacDelegate;
	// append length information
	ret.length = MAC.length;
	return ret;
}

export interface CipherDelegate {
	/**
	 * Encrypts the given plaintext buffer using previously defined parameters
	 * @param plaintext - The plaintext to be encrypted
	 */
	(plaintext: Buffer): Buffer;

}
export interface GenericCipherDelegate {
	/**
	 * Encrypts the given plaintext buffer
	 * @param plaintext - The plaintext to be encrypted
	 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the encryption
	 * @param connEnd - Denotes if the current entity is the server or client
	 */
	(plaintext: Buffer, keyMaterial: KeyMaterial, connEnd: ConnectionEnd): Buffer;

	/**
	 * The length of encryption keys in bytes
	 */
	keyLength: number;

	/**
	 * The length of IVs for each record
	 */
	recordIvLength: number;
}

export interface DecipherDelegate {
	/**
	 * Decrypts the given plaintext buffer using previously defined parameters
	 * @param ciphertext - The ciphertext to be decrypted
	 */
	(plaintext: Buffer): { err?: Error, result: Buffer };
}
export interface GenericDecipherDelegate {
	/**
	 * Decrypts the given plaintext buffer
	 * @param ciphertext - The ciphertext to be decrypted
	 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the decryption
	 * @param connEnd - Denotes if the current entity is the server or client
	 */
	(ciphertext: Buffer, keyMaterial: KeyMaterial, connEnd: ConnectionEnd): { err?: Error, result: Buffer };

	/**
	 * The length of decryption keys in bytes
	 */
	keyLength: number;

	/**
	 * The length of IVs for each record
	 */
	recordIvLength: number;
}

export interface MacDelegate {
	/**
	 * Generates a MAC hash from the given data using the underlying HMAC function.
	 * @param data - The data to be hashed
	 */
	(data: Buffer): Buffer;
}
export interface GenericMacDelegate {
	/**
	 * Generates a MAC hash from the given data using the underlying HMAC function.
	 * @param data - The data to be hashed
	 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the encryption
	 * @param sourceConnEnd - Denotes which connection end the packet is coming from
	 */
	(data: Buffer, keyMaterial: KeyMaterial, sourceConnEnd: ConnectionEnd): Buffer;
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


function createNullCipher(): GenericCipherDelegate {
	const ret = ((plaintext, _1, _2) => Buffer.from(plaintext)) as GenericCipherDelegate;
	ret.keyLength = 0;
	ret.recordIvLength = 0;
	return ret;
}
function createNullDecipher(): GenericDecipherDelegate {
	const ret =  ((ciphertext, _1, _2) => ({ result: Buffer.from(ciphertext) })) as GenericDecipherDelegate;
	ret.keyLength = 0;
	ret.recordIvLength = 0;
	return ret;
}
function createNullMAC(): GenericMacDelegate {
	const ret = ((data) => Buffer.from(data)) as GenericMacDelegate;
	ret.length = 0;
	return ret;
}

export class CipherSuite extends TLSStruct {

	static readonly __spec = {
		id: TypeSpecs.uint16
	};
	static readonly spec = TypeSpecs.define.Struct(CipherSuite);

	constructor(
		public readonly id: number,
		public readonly keyExchange: KeyExchangeAlgorithm,
		public readonly macAlgorithm: HashAlgorithm,
		public readonly prfAlgorithm: HashAlgorithm,
		public readonly cipherType: CipherType,
		public readonly algorithm?: (BlockCipher.BlockCipherAlgorithm | AEADAlgorithm)
	) {
		super(CipherSuite.__spec);
	}

	private _cipher: GenericCipherDelegate;
	public get Cipher(): GenericCipherDelegate {
		if (this._cipher == undefined)
			this._cipher = this.createCipher();
		return this._cipher;
	}
	private createCipher() : GenericCipherDelegate {
		switch (this.cipherType) {
			case null:
				return createNullCipher();
			case "block":
				return BlockCipher.createCipher(
					this.algorithm as BlockCipher.BlockCipherAlgorithm
				);
		}
	}
	public specifyCipher(keyMaterial: KeyMaterial, connEnd: ConnectionEnd): CipherDelegate {
		return (plaintext: Buffer) => this.Cipher(plaintext, keyMaterial, connEnd);
	}

	private _decipher: GenericDecipherDelegate;
	public get Decipher(): GenericDecipherDelegate {
		if (this._decipher == undefined)
			this._decipher = this.createDecipher();
		return this._decipher;
	}
	private createDecipher() : GenericDecipherDelegate {
		switch (this.cipherType) {
			case null:
				return createNullDecipher();
			case "block":
				return BlockCipher.createDecipher(
					this.algorithm as BlockCipher.BlockCipherAlgorithm
				);
		}
	}
	public specifyDecipher(keyMaterial: KeyMaterial, connEnd: ConnectionEnd): DecipherDelegate {
		return (plaintext: Buffer) => this.Decipher(plaintext, keyMaterial, connEnd);
	}

	private _mac: GenericMacDelegate;
	public get MAC(): GenericMacDelegate {
		if (this._mac == undefined)
			this._mac = this.createMAC();
		return this._mac;
	}
	private createMAC(): GenericMacDelegate {
		// TODO: detect special cases
		switch (this.cipherType) {
			case null:
				return createNullMAC();
			case "stream":
			case "block":
				if (this.macAlgorithm == null)
					return createNullMAC();
				return createMAC(this.macAlgorithm);
		}
	}
	public specifyMAC(keyMaterial: KeyMaterial, sourceConnEnd: ConnectionEnd): MacDelegate {
		return (data: Buffer) => this.MAC(data, keyMaterial, sourceConnEnd);
	}

}