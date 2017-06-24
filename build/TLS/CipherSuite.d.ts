/// <reference types="node" />
import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
import { ConnectionEnd } from "./ConnectionState";
import { KeyExchangeAlgorithm } from "./KeyExchange";
import * as BlockCipher from "./BlockCipher";
export declare type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha384" | "sha512";
export declare type CipherType = "stream" | "block" | "aead";
export declare enum AEADAlgorithm {
    AES_128_CCM = 3,
    AES_256_CCM = 4,
    AES_128_CCM_8 = 18,
    AES_256_CCM_8 = 19,
}
/**
 * Creates a block cipher delegate used to encrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 * @param sourceConnEnd - Denotes which connection end the packet is coming from
 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the encryption
 */
export declare function createMAC(algorithm: HashAlgorithm, sourceConnEnd: ConnectionEnd, keyMaterial: KeyMaterial): MACDelegate;
export declare type CipherDelegate = (plaintext: Buffer) => Buffer;
export declare type DecipherDelegate = (ciphertext: Buffer) => {
    err?: Error;
    result: Buffer;
};
export interface MACDelegate {
    /**
     * Generates a MAC hash from the given data using the underlying HMAC function.
     * @param data - The data to be hashed
     */
    (data: Buffer): Buffer;
    /**
     * The key and hash output length of this hash function
     */
    length: number;
}
export interface KeyMaterial {
    client_write_MAC_key: Buffer;
    server_write_MAC_key: Buffer;
    client_write_key: Buffer;
    server_write_key: Buffer;
    client_write_IV: Buffer;
    server_write_IV: Buffer;
}
export declare class CipherSuite extends TLSStruct {
    id: number;
    keyExchange: KeyExchangeAlgorithm;
    mac: HashAlgorithm;
    prf: HashAlgorithm;
    cipherType: CipherType;
    algorithm: (BlockCipher.BlockCipherAlgorithm | AEADAlgorithm);
    static readonly __spec: {
        id: Readonly<TypeSpecs.Number>;
    };
    constructor(id: number, keyExchange: KeyExchangeAlgorithm, mac: HashAlgorithm, prf: HashAlgorithm, cipherType: CipherType, algorithm?: (BlockCipher.BlockCipherAlgorithm | AEADAlgorithm));
    createCipher(connEnd: ConnectionEnd, keyMaterial: KeyMaterial): CipherDelegate;
    createDecipher(connEnd: ConnectionEnd, keyMaterial: KeyMaterial): DecipherDelegate;
    createMAC(sourceConnEnd: ConnectionEnd, keyMaterial: KeyMaterial): MACDelegate;
}
