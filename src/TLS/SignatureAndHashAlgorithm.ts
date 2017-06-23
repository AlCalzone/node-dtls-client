import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";

export enum HashAlgorithm {
	none = 0,
	md5 = 1,
	sha1 = 2,
	sha224 = 3,
	sha256 = 4,
	sha384 = 5,
	sha512 = 6
}
export namespace HashAlgorithm {
	export const __spec = TypeSpecs.define.Enum("uint8", HashAlgorithm);
}

export enum SignatureAlgorithm {
	anonymous = 0,
	rsa = 1,
	dsa = 2,
	ecdsa = 3
}
export namespace SignatureAlgorithm {
	export const __spec = TypeSpecs.define.Enum("uint8", SignatureAlgorithm);
}

export default class SignatureAndHashAlgorithm extends TLSStruct {

	static readonly __spec = {
		hash: HashAlgorithm.__spec,
		signature: SignatureAlgorithm.__spec
	}

	constructor(public hash: HashAlgorithm, public signature: SignatureAlgorithm) {
		super(SignatureAndHashAlgorithm.__spec);
	}
}