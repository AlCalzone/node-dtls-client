"use strict";
var crypto = require("crypto");
function HMAC_factory(algorithm) {
    /**
     * Generates a HMAC hash from the given secret and data.
     */
    return function (secret, data) {
        var hmac = crypto.createHmac(algorithm, secret);
        hmac.update(data);
        return hmac.digest();
    };
}
exports.HMAC = {
    "md5": HMAC_factory("md5"),
    "sha1": HMAC_factory("sha1"),
    "sha256": HMAC_factory("sha256"),
    "sha384": HMAC_factory("sha384"),
    "sha512": HMAC_factory("sha512"),
};
/**
 * Data expansion function: Turns a secret into an arbitrary quantity of output using a hash function and a seed.
 * @param algorithm - The algorithm to be used for hashing
 * @param secret - The secret to be expanded
 * @param seed - The seed used in the data expansion
 * @param length - The desired amount of data.
 * @see https://tools.ietf.org/html/rfc5246#section-5
 */
function P(algorithm, secret, seed, length) {
    if (length === void 0) { length = 32; }
    var _HMAC = exports.HMAC[algorithm];
    var _A = [seed];
    function A(i) {
        if (i >= _A.length) {
            // need to generate the value first
            _A.push(_HMAC(secret, A(i - 1)));
        }
        return _A[i];
    }
    var hashes = [];
    var hashesLength = 0;
    // iterate through the hash function
    for (var i = 1; hashesLength < length; i++) {
        var newHash = _HMAC(secret, Buffer.concat([A(i), seed]));
        hashes.push(newHash);
        hashesLength += newHash.length;
    }
    // concatenate the individual hashes and trim it to the desired length
    return Buffer.concat(hashes, hashesLength);
}
exports.PRF = {
    "md5": PRF_factory("md5"),
    "sha1": PRF_factory("sha1"),
    "sha256": PRF_factory("sha256"),
    "sha384": PRF_factory("sha384"),
    "sha512": PRF_factory("sha512"),
};
function PRF_factory(algorithm) {
    /**
     * (D)TLS v1.2 pseudorandom function. Earlier versions are not supported.
     * @param secret - The secret to be hashed
     * @param label - used together with seed to generate a hash from secret. Denotes the usage of this hash.
     * @param seed - used together with label to generate a hash from secret
     * @param length - the desired length of the output
     */
    return function (secret, label, seed, length) {
        if (length === void 0) { length = 32; }
        return P(algorithm, secret, Buffer.concat([Buffer.from(label, 'ascii'), seed]), length);
    };
}
//# sourceMappingURL=PRF.js.map