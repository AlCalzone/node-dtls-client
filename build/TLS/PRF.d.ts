/// <reference types="node" />
import { HashAlgorithm } from "../TLS/CipherSuite";
export interface HMACDelegate {
    /**
     * Generates a HMAC hash from the given secret and data.
     * @param secret - The secret used to hash the data
     * @param data - The data to be hashed
     */
    (secret: Buffer, data: Buffer): Buffer;
    /**
     * The key and hash output length of this hash function
     */
    length: number;
}
export declare const HMAC: {
    [algorithm in HashAlgorithm]: HMACDelegate;
};
export declare type PRFDelegate = (secret: Buffer, label: string, seed: Buffer, length?: number) => Buffer;
export declare const PRF: {
    [algorithm in HashAlgorithm]: PRFDelegate;
};
