import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import { KeyExchangeAlgorithm } from "./SecurityParameters";
export declare class ServerKeyExchange extends TLSStruct {
    algorithm: KeyExchangeAlgorithm;
    static readonly __specs: {
        [algorithm in KeyExchangeAlgorithm]?: TLSTypes.StructSpec;
    };
    constructor(algorithm: KeyExchangeAlgorithm);
}
export declare class ClientKeyExchange extends TLSStruct {
    algorithm: KeyExchangeAlgorithm;
    static readonly __specs: {
        [algorithm in KeyExchangeAlgorithm]?: TLSTypes.StructSpec;
    };
    constructor(algorithm: KeyExchangeAlgorithm);
}
