"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.gcm = exports.ccm = void 0;
const crypto = __importStar(require("crypto"));
const semver = __importStar(require("semver"));
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
    const decipher = crypto.createDecipheriv(algorithm, key, iv, { authTagLength: authTag.length });
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
    catch { /* nothing to do */ }
    return { plaintext, auth_ok };
}
let importedCCM;
let importedGCM;
let nativeCCM;
let nativeGCM;
if (!process.versions.electron &&
    semver.satisfies(process.versions.node, ">=10")) {
    // We can use the native methods
    nativeCCM = {
        encrypt: encryptNative.bind(undefined, "ccm"),
        decrypt: decryptNative.bind(undefined, "ccm"),
    };
    nativeGCM = {
        encrypt: encryptNative.bind(undefined, "gcm"),
        decrypt: decryptNative.bind(undefined, "gcm"),
    };
}
else {
    // import from the node-aead-crypto module
    ({ ccm: importedCCM, gcm: importedGCM } = require("node-aead-crypto"));
}
exports.ccm = importedCCM || nativeCCM;
exports.gcm = importedGCM || nativeGCM;
