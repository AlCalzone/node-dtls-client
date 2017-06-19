import { CipherDelegate, DecipherDelegate, KeyMaterial } from "./CipherSuite";
import { ConnectionEnd } from "./ConnectionState";
export declare type BlockCipherAlgorithm = "aes-128-cbc" | "aes-256-cbc" | "des-ede3-cbc";
/**
 * Creates a block cipher delegate used to encrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 * @param connEnd - Denotes if the current entity is the server or client
 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the encryption
 */
export declare function createCipher(algorithm: BlockCipherAlgorithm, connEnd: ConnectionEnd, keyMaterial: KeyMaterial): CipherDelegate;
/**
 * Creates a block cipher delegate used to decrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 * @param connEnd - Denotes if the current entity is the server or client
 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the decryption
 */
export declare function createDecipher(algorithm: BlockCipherAlgorithm, connEnd: ConnectionEnd, keyMaterial: KeyMaterial): DecipherDelegate;
