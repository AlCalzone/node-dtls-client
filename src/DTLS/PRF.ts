import crypto from "crypto";
import { MACAlgorithm } from "../TLS/SecurityParameter";

type cryptoAlgorithms = 
	"md5" |
	"sha1" | "sha256" | "sha384" | "sha512"
;

export type HMACDelegate = (secret: number[], data: number[]) => number[];

function HMAC_factory(algorithm: cryptoAlgorithms): HMACDelegate {
	/**
	 * Generates a HMAC hash from the given secret and data.
	 */
	return (secret: number[], data: number[]) => {
		const hmac = crypto.createHmac(algorithm, secret);
		hmac.update(data);
		return hmac.digest();
	}
}

export const HMAC : {
	[algorithm: MACAlgorithm]: HMACDelegate
} = {};
HMAC[MACAlgorithm.hmac_md5   ] = HMAC_factory("md5");
HMAC[MACAlgorithm.hmac_sha1  ] = HMAC_factory("sha1");
HMAC[MACAlgorithm.hmac_sha256] = HMAC_factory("sha256");
HMAC[MACAlgorithm.hmac_sha384] = HMAC_factory("sha384");
HMAC[MACAlgorithm.hmac_sha512] = HMAC_factory("sha512");


/**
 * Data expansion function: Turns a secret into an arbitrary quantity of output using a hash function and a seed.
 * @param algorithm - The algorithm to be used for hashing
 * @param secret - The secret to be expanded
 * @param seed - The seed used in the data expansion
 * @param length - The desired amount of data.
 * @see https://tools.ietf.org/html/rfc5246#section-5
 */
function P(algorithm: MACAlgorithm, secret: number[], seed: number[], length: number = 32) => {
	
	const _HMAC = HMAC(algorithm);
	
	const _A = [seed];
	function A(i) {
		if (i >= _A.length) {
			// need to generate the value first
			_A.push(_HMAC(secret, A(i-1)));
		}
		return _A[i];
	}
	
	const hashes = [];
	let hashesLength = 0;
	
	// iterate through the hash function
	for (let i = 1; hashesLength < length; i++) {
		let newHash = _HMAC(secret, A(i).concat(seed))
		hashes.push(newHash);
		hashesLength += newHash.length;
	}

	// concatenate the individual hashes and trim it to the desired length
	return Buffer.concat(hashes, hashesLength);
	
}



export type PRFDelegate = (secret: number[], label: string, seed: number[], length?: number) => number[];

export const PRF : {
	[algorithm: MACAlgorithm]: PRFDelegate
} = {};
PRF[MACAlgorithm.hmac_md5   ] = HMAC_factory(MACAlgorithm.hmac_md5);
PRF[MACAlgorithm.hmac_sha1  ] = HMAC_factory(MACAlgorithm.hmac_sha1);
PRF[MACAlgorithm.hmac_sha256] = HMAC_factory(MACAlgorithm.hmac_sha256);
PRF[MACAlgorithm.hmac_sha384] = HMAC_factory(MACAlgorithm.hmac_sha384);
PRF[MACAlgorithm.hmac_sha512] = HMAC_factory(MACAlgorithm.hmac_sha512);

function PRF_factory(algorithm: MACAlgorithm): PRFDelegate {
	/**
	 * (D)TLS v1.2 pseudorandom function. Earlier versions are not supported.
	 * @param secret - The secret to be hashed
	 * @param label - used together with seed to generate a hash from secret. Denotes the usage of this hash.
	 * @param seed - used together with label to generate a hash from secret
	 * @param length - the desired length of the output
	 */
	return (secret: number[], label: string, seed: number[], length: number = 32) => {
		return P(
			algorithm,
			secret,
			Buffer.concat([Buffer.from(label, 'ascii'), seed]),
			length
		)
	}
}