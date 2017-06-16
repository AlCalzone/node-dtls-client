import * as TLSTypes from "./TLSTypes";
export declare enum CompressionMethod {
    null = 0,
}
export declare namespace CompressionMethod {
    const __spec: TLSTypes.Enum;
}
export declare type ConnectionEnd = "server" | "client";
export declare type PRFAlgorithm = "md5" | "sha1" | "sha256" | "sha384" | "sha512";
export declare type BulkCipherAlgorithm = "aes-128-cbc" | "aes-256-cbc" | "des-ede3-cbc";
export declare type CipherType = "stream" | "block" | "aead";
export declare type MACAlgorithm = "md5" | "sha1" | "sha256" | "sha384" | "sha512";
export declare type KeyExchangeAlgorithm = "dhe_dss" | "dhe_rsa" | "rsa" | "dh_dss" | "dh_rsa" | "psk" | "dhe_psk" | "rsa_psk";
export declare enum AEADAlgorithm {
    AES_128_CCM = 3,
    AES_256_CCM = 4,
    AES_128_CCM_8 = 18,
    AES_256_CCM_8 = 19,
}
export declare class SecurityParameters {
    constructor(values: any);
    entity: ConnectionEnd;
    prf_algorithm: PRFAlgorithm;
    bulk_cipher_algorithm: BulkCipherAlgorithm;
    cipher_type: CipherType;
    enc_key_length: number;
    block_length: number;
    fixed_iv_length: number;
    record_iv_length: number;
    mac_algorithm: MACAlgorithm;
    mac_length: number;
    mac_key_length: number;
    compression_algorithm: CompressionMethod;
    master_secret: number[];
    client_random: number[];
    server_random: number[];
}
