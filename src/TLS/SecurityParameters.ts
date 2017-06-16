import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import { entries } from "../lib/object-polyfill";

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

export class SecurityParameters {

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
	master_secret: number[/*48*/];
	client_random: number[/*32*/];
	server_random: number[/*32*/];
	
	
	// Implementation details:
	
	// master_secret = PRF(
	// 	pre_master_secret, 
	// 	"master secret",
	// 	ClientHello.random + ServerHello.random
	// )[0..47];
	
}