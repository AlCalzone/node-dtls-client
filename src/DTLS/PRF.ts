/**
 * Data expansion function: Turns a secret into an arbitrary quantity of output using a hash function and a seed.
 * @param secret - The secret to be expanded
 * @param seed - The seed used in the data expansion
 * @param length - The desired amount of data.
 * @see https://tools.ietf.org/html/rfc5246#section-5
 */
function P_hash(secret: number[], seed: number[], length: number = 32) {
	
	const HMAC_hash = (secret, data) => []; // TODO: Implementieren, _hash ist eigentlich ein Array-Index
	
	const _A = [seed];
	function A(i) {
		if (i >= _A.length) {
			// need to generate the value first
			_A.push(HMAC_hash(secret, A(i-1)));
		}
		return _A[i];
	}
	
	const hashes = [];
	let hashesLength = 0;
	
	// iterate through the hash function
	for (let i = 1; hashesLength < length; i++) {
		let newHash = HMAC_hash(secret, A(i).concat(seed))
		hashes.push(newHash);
		hashesLength += newHash.length;
	}

	// concatenate the individual hashes and trim it to the desired length
	return Buffer.concat(hashes, hashesLength);
	
}

export function PRF(secret: number[], label: string, seed: number[], length: number = 32) {
	return P_hash(
		secret,
		Buffer.concat([Buffer.from(label, 'ascii'), seed]),
		length
	)
}