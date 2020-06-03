import { CipherSuites } from "../DTLS/CipherSuites";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { CipherDelegate, CipherSuite, DecipherDelegate, KeyMaterial } from "./CipherSuite";
import { PreMasterSecret } from "./PreMasterSecret";
import { PRF } from "./PRF";
import * as TypeSpecs from "./TypeSpecs";

export enum CompressionMethod {
	null = 0,
}
// tslint:disable-next-line:no-namespace
export namespace CompressionMethod {
	export const spec = TypeSpecs.define.Enum("uint8", CompressionMethod);
}

export type ConnectionEnd =
	"server" | "client"
	;

const master_secret_length = 48;
// const client_random_length = 32;
// const server_random_length = 32;

export class ConnectionState {

	// This doesn't seem to be used:
	// constructor(values?: Partial<ConnectionState>) {
	// 	if (values) {
	// 		for (const [key, value] of entries(values)) {
	// 			if (this.hasOwnProperty(key)) (this as any)[key] = value;
	// 		}
	// 	}
	// }

	public entity: ConnectionEnd = "client";
	public cipherSuite: CipherSuite = CipherSuites.TLS_NULL_WITH_NULL_NULL;
	public protocolVersion: ProtocolVersion = new ProtocolVersion(~1, ~0); // default to DTLSv1.0 during handshakes
	public compression_algorithm: CompressionMethod = CompressionMethod.null;
	public master_secret: Buffer /*48*/;
	public client_random: Buffer /*32*/;
	public server_random: Buffer /*32*/;
	public key_material: KeyMaterial;

	private _cipher: CipherDelegate;
	public get Cipher(): CipherDelegate {
		if (this._cipher == undefined) {
			this._cipher = this.cipherSuite.specifyCipher(this.key_material, this.entity);
		}
		return this._cipher;
	}
	private _decipher: DecipherDelegate;
	public get Decipher(): DecipherDelegate {
		if (this._decipher == undefined) {
			this._decipher = this.cipherSuite.specifyDecipher(this.key_material, this.entity);
		}
		return this._decipher;
	}

	/**
	 * Compute the master secret from a given premaster secret
	 * @param preMasterSecret - The secret used to calculate the master secret
	 * @param clientHelloRandom - The random data from the client hello message
	 * @param serverHelloRandom - The random data from the server hello message
	 */
	public computeMasterSecret(preMasterSecret: PreMasterSecret): void {
		this.master_secret = PRF[this.cipherSuite.prfAlgorithm](
			preMasterSecret.serialize(),
			"master secret",
			Buffer.concat([this.client_random, this.server_random]),
			master_secret_length,
		);

		// now we can compute the key material
		this.computeKeyMaterial();
	}

	/**
	 * Calculates the key components
	 */
	private computeKeyMaterial(): void {
		const keyBlock = PRF[this.cipherSuite.prfAlgorithm](
			this.master_secret,
			"key expansion",
			Buffer.concat([this.server_random, this.client_random]),
			2 * (this.cipherSuite.MAC.keyAndHashLength + this.cipherSuite.Cipher.keyLength + this.cipherSuite.Cipher.fixedIvLength),
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
			client_write_IV: read(this.cipherSuite.Cipher.fixedIvLength),
			server_write_IV: read(this.cipherSuite.Cipher.fixedIvLength),
		};

	}

}
