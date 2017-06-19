import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import { entries } from "../lib/object-polyfill";
import { PreMasterSecret } from "./PreMasterSecret";
import { PRF } from "./PRF";
import {
	PRFAlgorithm,
	BulkCipherAlgorithm,
	AEADAlgorithm,
	CipherType,
	MACAlgorithm,
	KeyExchangeAlgorithm
} from "./CipherSuite";

export enum CompressionMethod {
	null = 0
}
export namespace CompressionMethod {
	export const __spec = new TLSTypes.Enum("uint8", CompressionMethod);
}

export type ConnectionEnd =
	"server" | "client"
	;

const master_secret_length = 48;
const client_random_length = 32;
const server_random_length = 32;

export interface KeyMaterial {
	client_write_MAC_key: Buffer /*ConnectionState.mac_key_length*/;
	server_write_MAC_key: Buffer /*ConnectionState.mac_key_length*/;
	client_write_key: Buffer /*ConnectionState.enc_key_length*/;
	server_write_key: Buffer /*ConnectionState.enc_key_length*/;
	client_write_IV: Buffer /*ConnectionState.fixed_iv_length*/;
	server_write_IV: Buffer /*ConnectionState.fixed_iv_length*/;
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

	key_material: KeyMaterial

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
		
		this.key_material = {
			client_write_MAC_key: read(this.mac_key_length),
			server_write_MAC_key: read(this.mac_key_length),
			client_write_key: read(this.enc_key_length),
			server_write_key: read(this.enc_key_length),
			client_write_IV: read(this.fixed_iv_length),
			server_write_IV: read(this.fixed_iv_length)
		};
		
	}
	
}