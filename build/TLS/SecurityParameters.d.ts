import * as TLSTypes from "./TLSTypes";
export declare enum CompressionMethod {
    null = 0,
}
export declare namespace CompressionMethod {
    const __spec: TLSTypes.Enum;
}
export declare enum ConnectionEnd {
    server = 0,
    client = 1,
}
export declare enum PRFAlgorithm {
    tls_prf_sha256 = 0,
}
export declare enum BulkCipherAlgorithm {
    null = 0,
    rc4 = 1,
    _3des = 2,
    aes = 3,
}
export declare enum CipherType {
    stream = 0,
    block = 1,
    aead = 2,
}
export declare enum MACAlgorithm {
    null = 0,
    hmac_md5 = 1,
    hmac_sha1 = 2,
    hmac_sha256 = 3,
    hmac_sha384 = 4,
    hmac_sha512 = 5,
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
