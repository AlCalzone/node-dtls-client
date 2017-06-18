import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import { KeyExchangeAlgorithm } from "./SecurityParameters";

export class ServerKeyExchange extends TLSStruct {

	static readonly __specs: {
		[algorithm in KeyExchangeAlgorithm]?: TLSTypes.StructSpec
	} = {
		psk: {
			psk_identity_hint: new TLSTypes.Vector("uint8", 0, 2**16-1)
		}
	}

	constructor(public algorithm: KeyExchangeAlgorithm) {
		super(ServerKeyExchange.__specs[algorithm]);
	}
}


export class ClientKeyExchange extends TLSStruct {

	static readonly __specs: {
		[algorithm in KeyExchangeAlgorithm]?: TLSTypes.StructSpec
	} = {
		psk: {
			psk_identity: new TLSTypes.Vector("uint8", 0, 2 ** 16 - 1)
		}
	}

	constructor(public algorithm: KeyExchangeAlgorithm) {
		super(ClientKeyExchange.__specs[algorithm]);
	}
}
