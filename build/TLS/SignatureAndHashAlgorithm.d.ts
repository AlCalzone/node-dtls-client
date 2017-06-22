import { TLSStruct } from "./TLSStruct";
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
    const __spec: any;
}
export declare enum SignatureAlgorithm {
    anonymous = 0,
    rsa = 1,
    dsa = 2,
    ecdsa = 3,
}
export declare namespace SignatureAlgorithm {
    const __spec: any;
}
export default class SignatureAndHashAlgorithm extends TLSStruct {
    hash: HashAlgorithm;
    signature: SignatureAlgorithm;
    static readonly __spec: {
        hash: any;
        signature: any;
    };
    constructor(hash: HashAlgorithm, signature: SignatureAlgorithm);
}
