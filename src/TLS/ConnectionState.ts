import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import { entries } from "../lib/object-polyfill";
import { PreMasterSecret } from "./PreMasterSecret";
import { PRF } from "./PRF";

export enum CompressionMethod {
	null = 0
}
export namespace CompressionMethod {
	export const __spec = new TLSTypes.Enum("uint8", CompressionMethod);
}

export type ConnectionEnd =
	"server" | "client"
	;

export type PRFAlgorithm =
	"md5" |
	"sha1" | "sha256" | "sha384" | "sha512"
	;

export type BulkCipherAlgorithm = 
	"aes-128-cbc" | "aes-256-cbc" |
	"des-ede3-cbc"
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

const master_secret_length = 48;
const client_random_length = 32;
const server_random_length = 32;

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

export class ConnectionState {

	constructor(values) {
		for (let [key, value] of entries(values)) {
			if (this.hasOwnProperty(key)) this[key] = value;
		}
	}

	entity: ConnectionEnd;
	prf_algorithm: PRFAlgorithm;
	bulk_cipher_algorithm: BulkCipherAlgorithm;
	cipher_type: CipherType;
	enc_key_length: number;
	block_length: number;
	fixed_iv_length: number;
	record_iv_length: number;
	mac_algorithm: MACAlgorithm;
	mac_length: number;
	mac_key_length: number;
	compression_algorithm: CompressionMethod;
	master_secret: Buffer /*48*/;
	client_random: Buffer /*32*/;
	server_random: Buffer /*32*/;

	client_write_MAC_key: Buffer /*ConnectionState.mac_key_length*/;
	server_write_MAC_key: Buffer /*ConnectionState.mac_key_length*/;
	client_write_key: Buffer /*ConnectionState.enc_key_length*/;
	server_write_key: Buffer /*ConnectionState.enc_key_length*/;
	client_write_IV: Buffer /*ConnectionState.fixed_iv_length*/;
	server_write_IV: Buffer /*ConnectionState.fixed_iv_length*/;

	// TODO: Gehört das wirklich hier hin?
	/**
	 * Compute the master secret from a given premaster secret
	 * @param preMasterSecret - The secret used to calculate the master secret
	 * @param clientHelloRandom - The random data from the client hello message
	 * @param serverHelloRandom - The random data from the server hello message
	 */
	computeMasterSecret(preMasterSecret: PreMasterSecret, clientHelloRandom: Buffer, serverHelloRandom: Buffer): void {
		this.master_secret = PRF[this.prf_algorithm](
			preMasterSecret.serialize(),
			"master secret",
			Buffer.concat([clientHelloRandom, serverHelloRandom]),
			master_secret_length
		);
	}

	/**
	 * Berechnet die Schlüsselkomponenten
	 */
	computeKeyMaterial(): void {
		const keyBlock = PRF[this.prf_algorithm](
			this.master_secret,
			"key expansion",
			Buffer.concat([this.server_random, this.client_random]),
			2 * (this.mac_key_length + this.enc_key_length + this.fixed_iv_length)
		);

		let offset = 0;
		function read(length: number) {
			const ret = keyBlock.slice(offset, offset + length);
			offset += length;
			return ret;
		}
		this.client_write_MAC_key = read(this.mac_key_length);
		this.server_write_MAC_key = read(this.mac_key_length);
		this.client_write_key = read(this.enc_key_length);
		this.server_write_key = read(this.enc_key_length);
		this.client_write_IV = read(this.fixed_iv_length);
		this.server_write_IV = read(this.fixed_iv_length);

	}
	
}