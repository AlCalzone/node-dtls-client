/// <reference types="node" />
import * as TLSTypes from "./TLSTypes";
import { PreMasterSecret } from "./PreMasterSecret";
import { HashAlgorithm, CipherType, KeyMaterial } from "./CipherSuite";
export declare enum CompressionMethod {
    null = 0,
}
export declare namespace CompressionMethod {
    const __spec: TLSTypes.Enum;
}
export declare type ConnectionEnd = "server" | "client";
export declare class ConnectionState {
    constructor(values: any);
    entity: ConnectionEnd;
    prf_algorithm: HashAlgorithm;
    cipher_type: CipherType;
    enc_key_length: number;
    block_length: number;
    fixed_iv_length: number;
    record_iv_length: number;
    mac_algorithm: HashAlgorithm;
    mac_length: number;
    mac_key_length: number;
    compression_algorithm: CompressionMethod;
    master_secret: Buffer;
    client_random: Buffer;
    server_random: Buffer;
    key_material: KeyMaterial;
    /**
     * Compute the master secret from a given premaster secret
     * @param preMasterSecret - The secret used to calculate the master secret
     * @param clientHelloRandom - The random data from the client hello message
     * @param serverHelloRandom - The random data from the server hello message
     */
    computeMasterSecret(preMasterSecret: PreMasterSecret, clientHelloRandom: Buffer, serverHelloRandom: Buffer): void;
    /**
     * Berechnet die Schlüsselkomponenten
     */
    computeKeyMaterial(): void;
}
