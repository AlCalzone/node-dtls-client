import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import { PRFAlgorithm, BulkCipherAlgorithm, AEADAlgorithm, CipherType, MACAlgorithm, KeyExchangeAlgorithm } from "./SecurityParameters";
const crypto = require("crypto");

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
	}

}