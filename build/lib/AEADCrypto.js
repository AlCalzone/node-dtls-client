"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const semver = require("semver");
let CCMInterface;
exports.ccm = CCMInterface;
let GCMInterface;
exports.gcm = GCMInterface;
function encryptNative(mode, key, iv, plaintext, additionalData, authTagLength) {
    // prepare encryption
    const algorithm = `aes-${key.length * 8}-${mode}`;
    // @ts-ignore The 4th parameter is available starting in NodeJS 10+
    const cipher = crypto.createCipheriv(algorithm, key, iv, { authTagLength });
    // @ts-ignore The 2nd parameter is available starting in NodeJS 10+
    cipher.setAAD(additionalData, { plaintextLength: plaintext.length });
    // do encryption
    const ciphertext = cipher.update(plaintext);
    cipher.final();
    const auth_tag = cipher.getAuthTag();
    return { ciphertext, auth_tag };
}
function decryptNative(mode, key, iv, ciphertext, additionalData, authTag) {
    // prepare decryption
    const algorithm = `aes-${key.length * 8}-${mode}`;
    // @ts-ignore The 4th parameter is available starting in NodeJS 10+
    const decipher = crypto.createDecipheriv(algorithm, key, iv, { authTagLength });
    decipher.setAuthTag(authTag);
    // @ts-ignore The 2nd parameter is available starting in NodeJS 10+
    decipher.setAAD(additionalData, { plaintextLength: ciphertext.length });
    // do decryption
    const plaintext = decipher.update(ciphertext);
    // verify decryption
    let auth_ok = false;
    try {
        decipher.final();
        auth_ok = true;
    }
    catch (e) { /* nothing to do */ }
    return { plaintext, auth_ok };
}
if (semver.satisfies(process.version, ">=10")) {
    // We can use the native methods
    exports.ccm = CCMInterface = {
        encrypt: encryptNative.bind(undefined, "ccm"),
        decrypt: decryptNative.bind(undefined, "ccm"),
    };
    exports.gcm = GCMInterface = {
        encrypt: encryptNative.bind(undefined, "gcm"),
        decrypt: decryptNative.bind(undefined, "gcm"),
    };
}
else {
    // import from the node-aead-crypto module
    ({ ccm: CCMInterface, gcm: GCMInterface } = require("node-aead-crypto"));
}
