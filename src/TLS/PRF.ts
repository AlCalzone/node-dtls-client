import * as crypto from "crypto";
import { HashAlgorithm } from "../TLS/CipherSuite";

export interface HMACDelegate {
	/**
	 * Generates a HMAC hash from the given secret and data.
	 * @param secret - The secret used to hash the data
	 * @param data - The data to be hashed
	 */
	(secret: Buffer, data: Buffer): Buffer,
	/**
	 * The key and hash output length of this hash function
	 */
	length: number
};

function HMAC_factory(algorithm: HashAlgorithm, length: number): HMACDelegate {

	const ret = ((secret: Buffer, data: Buffer) => {
		const hmac = crypto.createHmac(algorithm, secret);
		hmac.update(data);
		return hmac.digest();
	}) as HMACDelegate;

	// add length information
	ret.length = length;

	return ret
}

export const HMAC: {
	[algorithm in HashAlgorithm]: HMACDelegate
} = {
	"md5": HMAC_factory("md5", 16),
	"sha1": HMAC_factory("sha1", 20),
	"sha256": HMAC_factory("sha256", 32),
	"sha384": HMAC_factory("sha384", 48),
	"sha512": HMAC_factory("sha512", 64),
};


/**
 * Data expansion function: Turns a secret into an arbitrary quantity of output using a hash function and a seed.
 * @param algorithm - The algorithm to be used for hashing
 * @param secret - The secret to be expanded
 * @param seed - The seed used in the data expansion
 * @param length - The desired amount of data.
 * @see https://tools.ietf.org/html/rfc5246#section-5
 */
function P(algorithm: HashAlgorithm, secret: Buffer, seed: Buffer, length: number = 32) {
	
	const _HMAC = HMAC[algorithm];
	
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
		let newHash = _HMAC(secret, Buffer.concat([A(i), seed]));
		hashes.push(newHash);
		hashesLength += newHash.length;
	}

	// concatenate the individual hashes and trim it to the desired length
	return Buffer.concat(hashes, hashesLength);
	
}



export type PRFDelegate = (secret: Buffer, label: string, seed: Buffer, length?: number) => Buffer;

export const PRF: {
	[algorithm in HashAlgorithm]: PRFDelegate
} = {
	"md5": PRF_factory("md5"),
	"sha1": PRF_factory("sha1"),
	"sha256": PRF_factory("sha256"),
	"sha384": PRF_factory("sha384"),
	"sha512": PRF_factory("sha512"),
};

function PRF_factory(algorithm: HashAlgorithm): PRFDelegate {
	/**
	 * (D)TLS v1.2 pseudorandom function. Earlier versions are not supported.
	 * @param secret - The secret to be hashed
	 * @param label - used together with seed to generate a hash from secret. Denotes the usage of this hash.
	 * @param seed - used together with label to generate a hash from secret
	 * @param length - the desired length of the output
	 */
	return (secret: Buffer, label: string, seed: Buffer, length: number = 32) => {
		return P(
			algorithm,
			secret,
			Buffer.concat([Buffer.from(label, 'ascii'), seed]),
			length
		)
	}
}