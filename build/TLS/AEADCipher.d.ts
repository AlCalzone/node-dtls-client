/// <reference types="node" />
import { KeyMaterial } from "./CipherSuite";
import { ConnectionEnd } from "./ConnectionState";
import { DTLSPacket } from "../DTLS/DTLSPacket";
export declare type AEADCipherAlgorithm = "aes-128-ccm" | "aes-256-ccm" | "aes-128-ccm8" | "aes-256-ccm8" | "aes-128-gcm" | "aes-256-gcm" | "aes-128-gcm8" | "aes-256-gcm8";
export interface AEADCipherDelegate {
    /**
     * Encrypts the given plaintext packet
     * @param plaintext - The plaintext to be encrypted
     * @param keyMaterial - The key material (mac and encryption keys) used in the encryption
     * @param connEnd - Denotes if the current entity is the server or client
     */
    (plaintext: DTLSPacket, keyMaterial: KeyMaterial, connEnd: ConnectionEnd): Buffer;
    /**
     * The length of encryption keys in bytes
     */
    keyLength: number;
    /**
     * The length of nonces for each record
     */
    nonceLength: number;
    /**
     * The block size of this algorithm
     */
    blockSize: number;
    /**
     * The length of the authentication tag in bytes.
     */
    authTagLength: number;
}
export interface AEADDecipherDelegate {
    /**
     * Decrypts the given ciphered packet
     * @param ciphertext - The ciphertext to be decrypted
     * @param keyMaterial - The key material (mac and encryption keys) used in the decryption
     * @param connEnd - Denotes if the current entity is the server or client
     */
    (ciphertext: DTLSPacket, keyMaterial: KeyMaterial, connEnd: ConnectionEnd): {
        err?: Error;
        result: Buffer;
    };
    /**
     * The length of decryption keys in bytes
     */
    keyLength: number;
    /**
     * The length of nonces for each record
     */
    nonceLength: number;
    /**
     * The block size of this algorithm
     */
    blockSize: number;
    /**
     * The length of the authentication tag in bytes.
     */
    authTagLength: number;
}
/**
 * Creates an AEAD cipher delegate used to encrypt packet fragments.
 * @param algorithm - The AEAD cipher algorithm to be used
 */
export declare function createCipher(algorithm: AEADCipherAlgorithm): AEADCipherDelegate;
/**
 * Creates an AEAD cipher delegate used to decrypt packet fragments.
 * @param algorithm - The AEAD cipher algorithm to be used
 */
export declare function createDecipher(algorithm: AEADCipherAlgorithm): AEADDecipherDelegate;
