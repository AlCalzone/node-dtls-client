import { TLSStruct } from "./TLSStruct";
import { PRFAlgorithm, BulkCipherAlgorithm, AEADAlgorithm, CipherType, MACAlgorithm, KeyExchangeAlgorithm } from "./SecurityParameters";
export declare class CipherSuite extends TLSStruct {
    id: number;
    keyExchange: KeyExchangeAlgorithm;
    mac: MACAlgorithm;
    prf: PRFAlgorithm;
    cipherType: CipherType;
    algorithm: (BulkCipherAlgorithm | AEADAlgorithm);
    static readonly __spec: {
        id: string;
    };
    constructor(id: number, keyExchange: KeyExchangeAlgorithm, mac: MACAlgorithm, prf: PRFAlgorithm, cipherType: CipherType, algorithm?: (BulkCipherAlgorithm | AEADAlgorithm));
    readonly keyLengths: {
        keyLength: number;
        blockSize: number;
        macLength: number;
    };
}
