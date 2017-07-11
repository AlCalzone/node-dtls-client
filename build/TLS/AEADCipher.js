"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var AEADCipherParameters = {
    "aes-128-ccm": { keyLength: 16, blockSize: 16, authTagLength: 16 },
    "aes-128-ccm8": { keyLength: 16, blockSize: 16, authTagLength: 8 },
    "aes-256-ccm": { keyLength: 16, blockSize: 32, authTagLength: 16 },
    "aes-256-ccm8": { keyLength: 16, blockSize: 32, authTagLength: 8 },
    "aes-128-gcm": { keyLength: 16, blockSize: 16, authTagLength: 16 },
    "aes-128-gcm8": { keyLength: 16, blockSize: 16, authTagLength: 8 },
    "aes-256-gcm": { keyLength: 16, blockSize: 32, authTagLength: 16 },
    "aes-256-gcm8": { keyLength: 16, blockSize: 32, authTagLength: 8 }
};
/**
 * Creates an AEAD cipher delegate used to encrypt packet fragments.
 * @param algorithm - The AEAD cipher algorithm to be used
 */
function createCipher(algorithm) {
    var params = AEADCipherParameters[algorithm];
    var ret = (function (packet, keyMaterial, connEnd) {
        var plaintext = packet.fragment;
        // figure out how much padding we need
        var overflow = ((plaintext.length + 1) % params.blockSize);
        var padLength = (overflow > 0) ? (params.blockSize - overflow) : 0;
        var padding = Buffer.alloc(padLength + 1, /*fill=*/ padLength); // one byte is the actual length of the padding array
        // find the right encryption params
        var record_iv = crypto.pseudoRandomBytes(params.blockSize);
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
    });
    // append key length information
    ret.keyLength = params.keyLength;
    ret.recordIvLength = ret.blockSize = params.blockSize;
    return ret;
}
exports.createCipher = createCipher;
/**
 * Creates an AEAD cipher delegate used to decrypt packet fragments.
 * @param algorithm - The AEAD cipher algorithm to be used
 */
function createDecipher(algorithm) {
    var keyLengths = BlockCipherParameters[algorithm];
    var ret = (function (packet, keyMaterial, connEnd) {
        var ciphertext = packet.fragment;
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
    });
    // append key length information
    ret.keyLength = keyLengths.keyLength;
    ret.recordIvLength = ret.blockSize = keyLengths.blockSize;
    return ret;
}
exports.createDecipher = createDecipher;
//# sourceMappingURL=AEADCipher.js.map