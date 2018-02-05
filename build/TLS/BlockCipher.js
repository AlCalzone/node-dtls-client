"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var DTLSCiphertext_1 = require("../DTLS/DTLSCiphertext");
var DTLSCompressed_1 = require("../DTLS/DTLSCompressed");
var BlockCipherParameters = {
    "aes-128-cbc": { keyLength: 16, blockSize: 16, recordIvLength: 16 },
    "aes-256-cbc": { keyLength: 32, blockSize: 16, recordIvLength: 16 },
    "des-ede3-cbc": { keyLength: 24, blockSize: 8, recordIvLength: 8 },
};
/**
 * Creates a block cipher delegate used to encrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 * @param mac - The MAC delegate to be used
 */
function createCipher(algorithm, mac) {
    var cipherParams = BlockCipherParameters[algorithm];
    var ret = (function (packet, keyMaterial, connEnd) {
        // compute the MAC for this packet
        var MAC = mac(Buffer.concat([
            packet.computeMACHeader(),
            packet.fragment,
        ]), keyMaterial, connEnd);
        // combine that with the MAC to form the plaintext and encrypt it
        var plaintext = Buffer.concat([
            packet.fragment,
            MAC,
        ]);
        // figure out how much padding we need
        var overflow = ((plaintext.length + 1) % cipherParams.blockSize);
        var padLength = (overflow > 0) ? (cipherParams.blockSize - overflow) : 0;
        var padding = Buffer.alloc(padLength + 1, /*fill=*/ padLength); // one byte is the actual length of the padding array
        // find the right encryption params
        var record_iv = crypto.pseudoRandomBytes(cipherParams.recordIvLength);
        var cipher_key = (connEnd === "server") ? keyMaterial.server_write_key : keyMaterial.client_write_key;
        var cipher = crypto.createCipheriv(algorithm, cipher_key, record_iv);
        cipher.setAutoPadding(false);
        // encrypt the plaintext
        var ciphertext = Buffer.concat([
            cipher.update(plaintext),
            cipher.update(padding),
            cipher.final(),
        ]);
        // prepend it with the iv
        var fragment = Buffer.concat([
            record_iv,
            ciphertext,
        ]);
        // and return the packet
        return new DTLSCiphertext_1.DTLSCiphertext(packet.type, packet.version, packet.epoch, packet.sequence_number, fragment);
    });
    // append key length information
    ret.keyLength = cipherParams.keyLength;
    ret.recordIvLength = cipherParams.recordIvLength;
    ret.blockSize = cipherParams.blockSize;
    return ret;
}
exports.createCipher = createCipher;
/**
 * Creates a block cipher delegate used to decrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 * @param mac - The MAC delegate to be used
 */
function createDecipher(algorithm, mac) {
    var decipherParams = BlockCipherParameters[algorithm];
    var ret = (function (packet, keyMaterial, connEnd) {
        function invalidMAC(deciphered) {
            // Even if we have an error, still return some plaintext.
            // This allows to prevent a CBC timing attack
            return {
                err: new Error("invalid MAC detected in DTLS packet"),
                result: deciphered,
            };
        }
        var ciphertext = packet.fragment;
        // decrypt in two steps. first try decrypting
        var decipherResult = (function () {
            // find the right decryption params
            var record_iv = ciphertext.slice(0, decipherParams.recordIvLength);
            var decipher_key = (connEnd === "client") ? keyMaterial.server_write_key : keyMaterial.client_write_key;
            var decipher = crypto.createDecipheriv(algorithm, decipher_key, record_iv);
            decipher.setAutoPadding(false);
            // decrypt the ciphertext
            var ciphered = ciphertext.slice(decipherParams.blockSize);
            var deciphered = Buffer.concat([
                decipher.update(ciphered),
                decipher.final(),
            ]);
            // check the padding
            var len = deciphered.length;
            if (len === 0)
                return invalidMAC(deciphered); // no data
            var paddingLength = deciphered[len - 1];
            if (len < paddingLength)
                return invalidMAC(deciphered); // not enough data
            for (var i = 1; i <= paddingLength; i++) {
                // wrong values in padding
                if (deciphered[len - 1 - i] !== paddingLength)
                    return invalidMAC(deciphered);
            }
            // strip off padding
            // tslint:disable-next-line:no-shadowed-variable
            var plaintext = Buffer.from(deciphered.slice(0, -1 - paddingLength));
            // contains fragment + MAC
            return { result: plaintext };
        })();
        var sourceConnEnd = (connEnd === "client") ? "server" : "client";
        // then verify the result/MAC
        if (decipherResult.err) {
            // calculate fake MAC to prevent a timing attack
            mac(decipherResult.result, keyMaterial, sourceConnEnd);
            // now throw the error
            throw decipherResult.err;
        }
        // split the plaintext into content and MAC
        var plaintext = decipherResult.result;
        var content;
        var receivedMAC;
        if (mac.keyAndHashLength > 0) {
            content = plaintext.slice(0, -mac.keyAndHashLength);
            receivedMAC = plaintext.slice(-mac.keyAndHashLength);
        }
        else {
            content = Buffer.from(plaintext);
            receivedMAC = Buffer.from([]);
        }
        // Create the compressed packet to return after verifying
        var result = new DTLSCompressed_1.DTLSCompressed(packet.type, packet.version, packet.epoch, packet.sequence_number, content);
        // compute the expected MAC for this packet
        var expectedMAC = mac(Buffer.concat([
            result.computeMACHeader(),
            result.fragment,
        ]), keyMaterial, sourceConnEnd);
        // and check if it matches the actual one
        if (!expectedMAC.equals(receivedMAC)) {
            throw invalidMAC().err;
        }
        return result;
    });
    // append key length information
    ret.keyLength = decipherParams.keyLength;
    ret.recordIvLength = decipherParams.recordIvLength;
    ret.blockSize = decipherParams.blockSize;
    return ret;
}
exports.createDecipher = createDecipher;
