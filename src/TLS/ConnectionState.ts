import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
import { entries } from "../lib/object-polyfill";
import { PreMasterSecret } from "./PreMasterSecret";
import { PRF } from "./PRF";
import {
	HashAlgorithm,
	//BulkCipherAlgorithm,
	//AEADAlgorithm,
	CipherType,
	KeyMaterial,
	CipherSuite,
	GenericCipherDelegate, CipherDelegate,
	GenericDecipherDelegate, DecipherDelegate,
	GenericMacDelegate, MacDelegate,
	KeyExchangeAlgorithm
} from "./CipherSuite";
import { CipherSuites } from "../DTLS/CipherSuites";

export enum CompressionMethod {
	null = 0
}
export namespace CompressionMethod {
	export const spec = TypeSpecs.define.Enum("uint8", CompressionMethod);
}

export type ConnectionEnd =
	"server" | "client"
	;

const master_secret_length = 48;
const client_random_length = 32;
const server_random_length = 32;

export class ConnectionState {

	constructor(values?) {
		if (values) {
			for (let [key, value] of entries(values)) {
				if (this.hasOwnProperty(key)) this[key] = value;
			}
		}
	}

	entity: ConnectionEnd = "client";
	cipherSuite: CipherSuite = CipherSuites.TLS_NULL_WITH_NULL_NULL;
	//prf_algorithm: HashAlgorithm;
	//bulk_cipher_algorithm: BulkCipherAlgorithm;
	//cipher_type: CipherType;
	//enc_key_length: number;
	//block_length: number;
	fixed_iv_length: number; // TODO: put it into cipher suite?
	//record_iv_length: number;
	//mac_algorithm: HashAlgorithm;
	//mac_length: number;
	//mac_key_length: number;
	compression_algorithm: CompressionMethod = CompressionMethod.null;
	master_secret: Buffer /*48*/;
	client_random: Buffer /*32*/;
	server_random: Buffer /*32*/;

	key_material: KeyMaterial

	// TODO: Gehört das wirklich hier hin?

	private _cipher: CipherDelegate;
	public get Cipher(): CipherDelegate {
		if (this._cipher == undefined)
			this._cipher = this.cipherSuite.specifyCipher(this.key_material, this.entity);
		return this._cipher;
	}
	private _decipher: DecipherDelegate;
	public get Decipher(): DecipherDelegate {
		if (this._decipher == undefined)
			this._decipher = this.cipherSuite.specifyDecipher(this.key_material, this.entity);
		return this._decipher;
	}
	private _outgoingMac: MacDelegate;
	public get OutgoingMac(): MacDelegate {
		if (this._outgoingMac == undefined)
			this._outgoingMac = this.cipherSuite.specifyMAC(this.key_material, this.entity);
		return this._outgoingMac;
	}
	private _incomingMac: MacDelegate;
	public get IncomingMac(): MacDelegate {
		if (this._incomingMac == undefined)
			this._incomingMac = this.cipherSuite.specifyMAC(this.key_material, this.entity === "client" ? "server" : "client");
		return this._incomingMac;
	}

	/**
	 * Compute the master secret from a given premaster secret
	 * @param preMasterSecret - The secret used to calculate the master secret
	 * @param clientHelloRandom - The random data from the client hello message
	 * @param serverHelloRandom - The random data from the server hello message
	 */
	computeMasterSecret(preMasterSecret: PreMasterSecret): void {
		this.master_secret = PRF[this.cipherSuite.prfAlgorithm](
			preMasterSecret.serialize(),
			"master secret",
			Buffer.concat([this.client_random, this.server_random]),
			master_secret_length
		);

		// now we can compute the key material
		this.computeKeyMaterial();
	}

	/**
	 * Berechnet die Schlüsselkomponenten
	 */
	private computeKeyMaterial(): void {
		const keyBlock = PRF[this.cipherSuite.prfAlgorithm](
			this.master_secret,
			"key expansion",
			Buffer.concat([this.server_random, this.client_random]),
			2 * (this.cipherSuite.MAC.keyAndHashLength + this.cipherSuite.Cipher.keyLength + this.fixed_iv_length)
		);

		let offset = 0;
		function read(length: number) {
			const ret = keyBlock.slice(offset, offset + length);
			offset += length;
			return ret;
		}
		
		this.key_material = {
			client_write_MAC_key: read(this.cipherSuite.MAC.keyAndHashLength),
			server_write_MAC_key: read(this.cipherSuite.MAC.keyAndHashLength),
			client_write_key: read(this.cipherSuite.Cipher.keyLength),
			server_write_key: read(this.cipherSuite.Cipher.keyLength),
			client_write_IV: read(this.fixed_iv_length),
			server_write_IV: read(this.fixed_iv_length)
		};
		
	}
	
}