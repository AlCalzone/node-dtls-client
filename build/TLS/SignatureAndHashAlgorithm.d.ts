import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
export default class SignatureAndHashAlgorithm extends TLSStruct {
    hash: HashAlgorithm;
    signature: SignatureAlgorithm;
    static readonly __spec: {
        hash: TLSTypes.Enum;
        signature: TLSTypes.Enum;
    };
    constructor(hash: HashAlgorithm, signature: SignatureAlgorithm);
}
export declare enum HashAlgorithm {
    none = 0,
    md5 = 1,
    sha1 = 2,
    sha224 = 3,
    sha256 = 4,
    sha384 = 5,
    sha512 = 6,
}
export declare namespace HashAlgorithm {
    const __spec: TLSTypes.Enum;
}
export declare enum SignatureAlgorithm {
    anonymous = 0,
    rsa = 1,
    dsa = 2,
    ecdsa = 3,
}
export declare namespace SignatureAlgorithm {
    const __spec: TLSTypes.Enum;
}
