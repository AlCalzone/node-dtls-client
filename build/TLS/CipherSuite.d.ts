/// <reference types="node" />
import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
import { ConnectionEnd } from "./ConnectionState";
import * as BlockCipher from "./BlockCipher";
export declare type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha384" | "sha512";
export declare type CipherType = "stream" | "block" | "aead";
export declare enum AEADAlgorithm {
    AES_128_CCM = 3,
    AES_256_CCM = 4,
    AES_128_CCM_8 = 18,
    AES_256_CCM_8 = 19,
}
export declare type KeyExchangeAlgorithm = "dhe_dss" | "dhe_rsa" | "rsa" | "dh_dss" | "dh_rsa" | "psk" | "dhe_psk" | "rsa_psk";
/**
 * Creates a block cipher delegate used to encrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 */
export declare function createMAC(algorithm: HashAlgorithm): GenericMacDelegate;
export interface CipherDelegate {
    /**
     * Encrypts the given plaintext buffer using previously defined parameters
     * @param plaintext - The plaintext to be encrypted
     */
    (plaintext: Buffer): Buffer;
}
export interface GenericCipherDelegate {
    /**
     * Encrypts the given plaintext buffer
     * @param plaintext - The plaintext to be encrypted
     * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the encryption
     * @param connEnd - Denotes if the current entity is the server or client
     */
    (plaintext: Buffer, keyMaterial: KeyMaterial, connEnd: ConnectionEnd): Buffer;
    /**
     * The length of encryption keys in bytes
     */
    keyLength: number;
    /**
     * The length of IVs for each record
     */
    recordIvLength: number;
}
export interface DecipherDelegate {
    /**
     * Decrypts the given plaintext buffer using previously defined parameters
     * @param ciphertext - The ciphertext to be decrypted
     */
    (plaintext: Buffer): {
        err?: Error;
        result: Buffer;
    };
}
export interface GenericDecipherDelegate {
    /**
     * Decrypts the given plaintext buffer
     * @param ciphertext - The ciphertext to be decrypted
     * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the decryption
     * @param connEnd - Denotes if the current entity is the server or client
     */
    (ciphertext: Buffer, keyMaterial: KeyMaterial, connEnd: ConnectionEnd): {
        err?: Error;
        result: Buffer;
    };
    /**
     * The length of decryption keys in bytes
     */
    keyLength: number;
    /**
     * The length of IVs for each record
     */
    recordIvLength: number;
}
export interface MacDelegate {
    /**
     * Generates a MAC hash from the given data using the underlying HMAC function.
     * @param data - The data to be hashed
     */
    (data: Buffer): Buffer;
}
export interface GenericMacDelegate {
    /**
     * Generates a MAC hash from the given data using the underlying HMAC function.
     * @param data - The data to be hashed
     * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the encryption
     * @param sourceConnEnd - Denotes which connection end the packet is coming from
     */
    (data: Buffer, keyMaterial: KeyMaterial, sourceConnEnd: ConnectionEnd): Buffer;
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
    readonly id: number;
    readonly keyExchange: KeyExchangeAlgorithm;
    readonly macAlgorithm: HashAlgorithm;
    readonly prfAlgorithm: HashAlgorithm;
    readonly cipherType: CipherType;
    readonly algorithm: (BlockCipher.BlockCipherAlgorithm | AEADAlgorithm);
    readonly verify_data_length: number;
    static readonly __spec: {
        id: Readonly<TypeSpecs.Number>;
    };
    static readonly spec: TypeSpecs.Struct;
    constructor(id: number, keyExchange: KeyExchangeAlgorithm, macAlgorithm: HashAlgorithm, prfAlgorithm: HashAlgorithm, cipherType: CipherType, algorithm?: (BlockCipher.BlockCipherAlgorithm | AEADAlgorithm), verify_data_length?: number);
    static createEmpty(): CipherSuite;
    private _cipher;
    readonly Cipher: GenericCipherDelegate;
    private createCipher();
    specifyCipher(keyMaterial: KeyMaterial, connEnd: ConnectionEnd): CipherDelegate;
    private _decipher;
    readonly Decipher: GenericDecipherDelegate;
    private createDecipher();
    specifyDecipher(keyMaterial: KeyMaterial, connEnd: ConnectionEnd): DecipherDelegate;
    private _mac;
    readonly MAC: GenericMacDelegate;
    private createMAC();
    specifyMAC(keyMaterial: KeyMaterial, sourceConnEnd: ConnectionEnd): MacDelegate;
}
