import { PRFAlgorithm, MACAlgorithm } from "../TLS/SecurityParameters";
export declare type HMACDelegate = (secret: Buffer, data: Buffer) => Buffer;
export declare const HMAC: {
    [algorithm in MACAlgorithm]: HMACDelegate;
};
export declare type PRFDelegate = (secret: Buffer, label: string, seed: Buffer, length?: number) => Buffer;
export declare const PRF: {
    [algorithm in PRFAlgorithm]: PRFDelegate;
};
