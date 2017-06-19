"use strict";
var crypto = require("crypto");
var BlockCipherParameters = {
    "aes-128-cbc": { keyLength: 16, blockSize: 16 },
    "aes-256-cbc": { keyLength: 16, blockSize: 16 },
    "des-ede3-cbc": { keyLength: 24, blockSize: 16 },
};
/**
 * Creates a block cipher delegate used to encrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 * @param connEnd - Denotes if the current entity is the server or client
 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the encryption
 */
function createCipher(algorithm, connEnd, keyMaterial) {
    var keyLengths = BlockCipherParameters[algorithm];
    /**
     * @param plaintext - The plaintext to be encrypted
     */
    return function (plaintext) {
        // figure out how much padding we need
        var overflow = ((plaintext.length + 1) % keyLengths.blockSize);
        var padLength = (overflow > 0) ? (keyLengths.blockSize - overflow) : 0;
        var padding = Buffer.alloc(padLength + 1, /*fill=*/ padLength); // one byte is the actual length of the padding array
        // find the right encryption params
        var record_iv = crypto.pseudoRandomBytes(keyLengths.blockSize);
        var cipher_key = (connEnd === "server") ? keyMaterial.server_write_key : keyMaterial.client_write_key;
        var cipher = crypto.createCipheriv(algorithm, cipher_key, record_iv);
        cipher.setAutoPadding(false);
        // encrypt the plaintext
        var ciphertext = Buffer.concat([
            cipher.update(plaintext),
            cipher.update(padding),
            cipher.final()
        ]);
        // prepend it with the iv
        return Buffer.concat([
            record_iv,
            ciphertext
        ]);
    };
}
exports.createCipher = createCipher;
/**
 * Creates a block cipher delegate used to decrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 * @param connEnd - Denotes if the current entity is the server or client
 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the decryption
 */
function createDecipher(algorithm, connEnd, keyMaterial) {
    var keyLengths = BlockCipherParameters[algorithm];
    /**
     * @param ciphertext - The ciphertext to be decrypted
     */
    return function (ciphertext) {
        // find the right decryption params
        var record_iv = ciphertext.slice(0, keyLengths.blockSize);
        var decipher_key = (connEnd === "client") ? keyMaterial.server_write_key : keyMaterial.client_write_key;
        var decipher = crypto.createDecipheriv(algorithm, decipher_key, record_iv);
        decipher.setAutoPadding(false);
        // decrypt the ciphertext
        var ciphered = ciphertext.slice(keyLengths.blockSize);
        var deciphered = Buffer.concat([
            decipher.update(ciphered),
            decipher.final()
        ]);
        function invalidMAC() {
            // Even if we have an error, still return some plaintext.
            // This allows to prevent a CBC timing attack
            return {
                err: new Error("invalid MAC detected in DTLS packet"),
                result: deciphered
            };
        }
        // check the padding
        var len = deciphered.length;
        if (len === 0)
            return invalidMAC(); // no data
        var paddingLength = deciphered[len - 1];
        if (len < paddingLength)
            throw invalidMAC(); // not enough data
        for (var i = 1; i <= paddingLength; i++) {
            // wrong values in padding
            if (deciphered[len - 1 - i] !== paddingLength)
                throw invalidMAC();
        }
        // strip off padding
        var plaintext = Buffer.from(deciphered.slice(0, -1 - paddingLength));
        // contains fragment + MAC
        return { result: plaintext };
    };
}
exports.createDecipher = createDecipher;
//# sourceMappingURL=BlockCipher.js.map