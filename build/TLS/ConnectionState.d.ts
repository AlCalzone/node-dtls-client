/// <reference types="node" />
import * as TypeSpecs from "./TypeSpecs";
import { PreMasterSecret } from "./PreMasterSecret";
import { KeyMaterial, CipherSuite, CipherDelegate, DecipherDelegate, MacDelegate } from "./CipherSuite";
export declare enum CompressionMethod {
    null = 0,
}
export declare namespace CompressionMethod {
    const __spec: TypeSpecs.Enum;
}
export declare type ConnectionEnd = "server" | "client";
export declare class ConnectionState {
    constructor(values: any);
    entity: ConnectionEnd;
    cipherSuite: CipherSuite;
    fixed_iv_length: number;
    compression_algorithm: CompressionMethod;
    master_secret: Buffer;
    client_random: Buffer;
    server_random: Buffer;
    key_material: KeyMaterial;
    private _cipher;
    readonly Cipher: CipherDelegate;
    private _decipher;
    readonly Decipher: DecipherDelegate;
    private _mac;
    readonly Mac: MacDelegate;
    /**
     * Compute the master secret from a given premaster secret
     * @param preMasterSecret - The secret used to calculate the master secret
     * @param clientHelloRandom - The random data from the client hello message
     * @param serverHelloRandom - The random data from the server hello message
     */
    computeMasterSecret(preMasterSecret: PreMasterSecret): void;
    /**
     * Berechnet die Schlüsselkomponenten
     */
    computeKeyMaterial(): void;
}
