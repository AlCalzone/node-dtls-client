import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import { entries } from "../lib/object-polyfill";

export enum CompressionMethod {
	null = 0
}
export namespace CompressionMethod {
	export const __spec = new TLSTypes.Enum("uint8", CompressionMethod);
}

export enum ConnectionEnd {
	server,
	client
}

export enum PRFAlgorithm {
	null,
	tls_prf_md5,
	tls_prf_sha1,
	tls_prf_sha256,
	tls_prf_sha384,
	tls_prf_sha512
}

export enum BulkCipherAlgorithm {
	null,
	// forbidden: rc4,
	des3,
	aes
}

export enum CipherType {
	stream,
	block,
	aead
}

export enum MACAlgorithm {
	null,
	hmac_md5,
	hmac_sha1,
	hmac_sha256,
	hmac_sha384,
	hmac_sha512
}

export enum KeyExchangeAlgorithm {
	dhe_dss, 
	dhe_rsa, 
	// forbidden: dh_anon, 
	rsa, 
	dh_dss, 
	dh_rsa,
	psk, // Server/Client|KeyExchange: see https://tools.ietf.org/html/rfc4279#page-4
	dhe_psk,
	rsa_psk
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