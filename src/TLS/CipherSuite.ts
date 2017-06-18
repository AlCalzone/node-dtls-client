import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import {
	PRFAlgorithm,
	BulkCipherAlgorithm,
	AEADAlgorithm,
	CipherType,
	MACAlgorithm,
	KeyExchangeAlgorithm
} from "./SecurityParameters";
import { extend } from "../lib/object-polyfill";

interface BulkCipherParameter {
	keyLength: number,
	blockSize: number
}
/**
 * The length of encryption keys and block size for each algorithm in bytes
 */
const BulkCipherParameters: {
	[algorithm in BulkCipherAlgorithm]?: BulkCipherParameter
} = {
		"aes-128-cbc": { keyLength: 16, blockSize: 16 },
		"aes-256-cbc": { keyLength: 16, blockSize: 16 },
		"des-ede3-cbc": { keyLength: 24, blockSize: 16 },
	};

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
		public algorithm?: (BulkCipherAlgorithm | AEADAlgorithm)
	) {
		super(CipherSuite.__spec);

		// Initialwerte für Schlüssellängen etc. merken
		switch (this.cipherType) {
			case "block":
				this.keyLengths = extend(
					BulkCipherParameters[algorithm as BulkCipherAlgorithm],
					{ macLength: MACKeyLengths[mac] }
				);
				break;
		}
	}

	public readonly keyLengths: {
		keyLength: number,
		blockSize: number,
		macLength: number
	}

}