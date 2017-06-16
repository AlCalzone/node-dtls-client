import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import { KeyExchangeAlgorithm, PRFAlgorithm, BulkCipherAlgorithm, CipherType, MACAlgorithm, KeyExchangeAlgorithm } from "./SecurityParameters";

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
		public bulkCipher?: BulkCipherAlgorithm = BulkCipherAlgorithm.null
	) {
		super(CipherSuite.__spec);
	}

}