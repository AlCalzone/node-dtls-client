import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
export declare type KeyExchangeAlgorithm = "dhe_dss" | "dhe_rsa" | "rsa" | "dh_dss" | "dh_rsa" | "psk" | "dhe_psk" | "rsa_psk";
export declare class ServerKeyExchange extends TLSStruct {
    algorithm: KeyExchangeAlgorithm;
    static readonly __specs: {
        [algorithm in KeyExchangeAlgorithm]?: TypeSpecs.StructSpec;
    };
    constructor(algorithm: KeyExchangeAlgorithm);
}
export declare class ClientKeyExchange extends TLSStruct {
    algorithm: KeyExchangeAlgorithm;
    static readonly __specs: {
        [algorithm in KeyExchangeAlgorithm]?: TypeSpecs.StructSpec;
    };
    constructor(algorithm: KeyExchangeAlgorithm);
}
