import { DTLSCiphertext } from "../DTLS/DTLSCiphertext";
import { DTLSCompressed } from "../DTLS/DTLSCompressed";
import * as AEADCipher from "./AEADCipher";
import * as BlockCipher from "./BlockCipher";
import { ConnectionEnd } from "./ConnectionState";
import { HMAC } from "./PRF";
import { TLSStruct } from "./TLSStruct";
import * as TypeSpecs from "./TypeSpecs";

export type HashAlgorithm =
	"md5" |
	"sha1" | "sha256" | "sha384" | "sha512"
	;

export type CipherType =
	/* forbidden "stream" | */
	"block" | "aead"
	;

export type KeyExchangeAlgorithm =
	"dhe_dss" | "dhe_rsa" |
	// forbidden: dh_anon,
	"rsa" | "dh_dss" | "dh_rsa" |
	"psk" | "dhe_psk" | "rsa_psk"// Server/Client|KeyExchange: see https://tools.ietf.org/html/rfc4279#page-4
	;

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
	keyAndHashLength: number;
}

/**
 * Creates a block cipher delegate used to encrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 */
export function createMAC(
	algorithm: HashAlgorithm,
): GenericMacDelegate {

	// const keyLength = MACKeyLengths[algorithm];
	const MAC = HMAC[algorithm];

	const ret = ((data: Buffer, keyMaterial: KeyMaterial, sourceConnEnd: ConnectionEnd) => {
		// find the right hash params
		const mac_key = (sourceConnEnd === "server") ? keyMaterial.server_write_MAC_key : keyMaterial.client_write_MAC_key;
		// and return the hash
		return MAC(mac_key, data);
	}) as GenericMacDelegate;
	// append length information
	ret.keyAndHashLength = MAC.keyAndHashLenth;
	return ret;
}

export interface CipherDelegate {
	/**
	 * Encrypts the given plaintext packet using previously defined parameters
	 * @param packet - The plaintext packet to be encrypted
	 */
	(packet: DTLSCompressed): DTLSCiphertext;

	/**
	 * The inner delegate. This can represent different cipher types like block and AEAD ciphers
	 */
	inner: GenericCipherDelegate;
}
export interface GenericCipherDelegate {
	/**
	 * Encrypts the given plaintext packet
	 * @param packet - The plaintext packet to be encrypted
	 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the encryption
	 * @param connEnd - Denotes if the current entity is the server or client
	 */
	(packet: DTLSCompressed, keyMaterial: KeyMaterial, connEnd: ConnectionEnd): DTLSCiphertext;

	/**
	 * The length of encryption keys in bytes
	 */
	keyLength: number;
	/**
	 * The length of fixed (for each session) IVs in bytes
	 */
	fixedIvLength: number;
	/**
	 * The length of record IVs in bytes
	 */
	recordIvLength: number;

	/**
	 * The MAC delegate used to authenticate packets.
	 * May be null for certain ciphers.
	 */
	MAC: GenericMacDelegate;
}

export interface DecipherDelegate {
	/**
	 * Decrypts the given ciphertext packet using previously defined parameters
	 * @param packet - The ciphertext to be decrypted
	 */
	(packet: DTLSCiphertext): DTLSCompressed;

	/**
	 * The inner delegate. This can represent different cipher types like block and AEAD ciphers
	 */
	inner: GenericDecipherDelegate;
}
export interface GenericDecipherDelegate {
	/**
	 * Decrypts the given ciphertext packet
	 * @param packet - The ciphertext packet to be decrypted
	 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the decryption
	 * @param connEnd - Denotes if the current entity is the server or client
	 */
	(packet: DTLSCiphertext, keyMaterial: KeyMaterial, connEnd: ConnectionEnd): DTLSCompressed;

	/**
	 * The length of decryption keys in bytes
	 */
	keyLength: number;
	/**
	 * The length of fixed (for each session) IVs in bytes
	 */
	fixedIvLength: number;
	/**
	 * The length of record IVs in bytes
	 */
	recordIvLength: number;

	/**
	 * The MAC delegate used to authenticate packets.
	 * May be null for certain ciphers.
	 */
	MAC: GenericMacDelegate;
}

export interface KeyMaterial {
	client_write_MAC_key: Buffer /*ConnectionState.mac_key_length*/;
	server_write_MAC_key: Buffer /*ConnectionState.mac_key_length*/;
	client_write_key: Buffer /*ConnectionState.enc_key_length*/;
	server_write_key: Buffer /*ConnectionState.enc_key_length*/;
	client_write_IV: Buffer /*ConnectionState.fixed_iv_length*/;
	server_write_IV: Buffer /*ConnectionState.fixed_iv_length*/;
}

/** Creates a dummy cipher which is just an identity operation */
function createNullCipher(): GenericCipherDelegate {
	const ret = ((packet: DTLSCompressed, _1, _2) => new DTLSCiphertext(
		packet.type,
		packet.version,
		packet.epoch,
		packet.sequence_number,
		packet.fragment,
	)) as GenericCipherDelegate;
	ret.keyLength = 0;
	ret.fixedIvLength = 0;
	ret.recordIvLength = 0;
	return ret;
}
/** Creates a dummy decipher which is just an identity operation */
function createNullDecipher(): GenericDecipherDelegate {
	const ret = ((packet: DTLSCiphertext, _1, _2) => new DTLSCompressed(
		packet.type,
		packet.version,
		packet.epoch,
		packet.sequence_number,
		packet.fragment,
	)) as GenericDecipherDelegate;
	ret.keyLength = 0;
	ret.fixedIvLength = 0;
	ret.recordIvLength = 0;
	return ret;
}
/** Creates a dummy MAC which just returns an empty Buffer */
function createNullMAC(): GenericMacDelegate {
	const ret = ((data, _1, _2) => Buffer.from([])) as GenericMacDelegate;
	ret.keyAndHashLength = 0;
	return ret;
}

// TODO: Documentation
export class CipherSuite extends TLSStruct {

	public static readonly __spec = {
		id: TypeSpecs.uint16,
	};
	public static readonly spec = TypeSpecs.define.Struct(CipherSuite);

	constructor(
		public readonly id: number,
		public readonly keyExchange: KeyExchangeAlgorithm,
		public readonly macAlgorithm: HashAlgorithm,
		public readonly prfAlgorithm: HashAlgorithm,
		public readonly cipherType: CipherType,
		public readonly algorithm?: (BlockCipher.BlockCipherAlgorithm | AEADCipher.AEADCipherAlgorithm),
		public readonly verify_data_length: number = 12,
	) {
		super(CipherSuite.__spec);
	}

	public static createEmpty(): CipherSuite {
		return new CipherSuite(null, null, null, null, null);
	}

	private _cipher: GenericCipherDelegate;
	public get Cipher(): GenericCipherDelegate {
		if (this._cipher == undefined) {
			this._cipher = this.createCipher();
		}
		return this._cipher;
	}
	private createCipher(): GenericCipherDelegate {
		const ret = (() => {
			switch (this.cipherType) {
				case null:
					return createNullCipher();
				case "block":
					return BlockCipher.createCipher(
						this.algorithm as BlockCipher.BlockCipherAlgorithm,
						this.MAC,
					);
				case "aead":
					return AEADCipher.createCipher(
						this.algorithm as AEADCipher.AEADCipherAlgorithm,
					);
				default:
					throw new Error(`createCipher not implemented for ${this.cipherType} cipher`);
			}
		})();
		if (!ret.keyLength) ret.keyLength = 0;
		if (!ret.fixedIvLength) ret.fixedIvLength = 0;
		if (!ret.recordIvLength) ret.recordIvLength = 0;
		return ret;
	}
	public specifyCipher(keyMaterial: KeyMaterial, connEnd: ConnectionEnd): CipherDelegate {
		const ret = (
			(plaintext: DTLSCompressed) => this.Cipher(plaintext, keyMaterial, connEnd)
		) as CipherDelegate;
		ret.inner = this.Cipher;
		return ret;
	}

	private _decipher: GenericDecipherDelegate;
	public get Decipher(): GenericDecipherDelegate {
		if (this._decipher == undefined) {
			this._decipher = this.createDecipher();
		}
		return this._decipher;
	}
	private createDecipher(): GenericDecipherDelegate {
		const ret = (() => {
			switch (this.cipherType) {
				case null:
					return createNullDecipher();
				case "block":
					return BlockCipher.createDecipher(
						this.algorithm as BlockCipher.BlockCipherAlgorithm,
						this.MAC,
					);
				case "aead":
					return AEADCipher.createDecipher(
						this.algorithm as AEADCipher.AEADCipherAlgorithm,
					);
				default:
					throw new Error(`createDecipher not implemented for ${this.cipherType} cipher`);
			}
		})();
		if (!ret.keyLength) ret.keyLength = 0;
		if (!ret.fixedIvLength) ret.fixedIvLength = 0;
		if (!ret.recordIvLength) ret.recordIvLength = 0;
		return ret;
	}
	public specifyDecipher(keyMaterial: KeyMaterial, connEnd: ConnectionEnd): DecipherDelegate {
		const ret = (
			(packet: DTLSCiphertext) => this.Decipher(packet, keyMaterial, connEnd)
		) as DecipherDelegate;
		ret.inner = this.Decipher;
		return ret;
	}

	private _mac: GenericMacDelegate;
	public get MAC(): GenericMacDelegate {
		if (this._mac == undefined) {
			this._mac = this.createMAC();
		}
		return this._mac;
	}
	private createMAC(): GenericMacDelegate {
		switch (this.cipherType) {
			case null:
			case "aead":
				return createNullMAC();
			case "block":
				if (this.macAlgorithm == null) {
					return createNullMAC();
				}
				return createMAC(this.macAlgorithm);
			default:
				throw new Error(`createMAC not implemented for ${this.cipherType} cipher`);
		}
	}

}
