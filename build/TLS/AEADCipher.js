"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var DTLSCiphertext_1 = require("../DTLS/DTLSCiphertext");
var DTLSCompressed_1 = require("../DTLS/DTLSCompressed");
var ContentType_1 = require("../TLS/ContentType");
var ProtocolVersion_1 = require("../TLS/ProtocolVersion");
var TLSStruct_1 = require("./TLSStruct");
var TypeSpecs = require("./TypeSpecs");
var node_aead_crypto_1 = require("node-aead-crypto");
var AEADCipherParameters = {
    "aes-128-ccm": { interface: node_aead_crypto_1.ccm, keyLength: 16, blockSize: 16, fixedIvLength: 4, recordIvLength: 8, authTagLength: 16 },
    "aes-128-ccm8": { interface: node_aead_crypto_1.ccm, keyLength: 16, blockSize: 16, fixedIvLength: 4, recordIvLength: 8, authTagLength: 8 },
    "aes-256-ccm": { interface: node_aead_crypto_1.ccm, keyLength: 16, blockSize: 32, fixedIvLength: 4, recordIvLength: 8, authTagLength: 16 },
    "aes-256-ccm8": { interface: node_aead_crypto_1.ccm, keyLength: 16, blockSize: 32, fixedIvLength: 4, recordIvLength: 8, authTagLength: 8 },
    "aes-128-gcm": { interface: node_aead_crypto_1.gcm, keyLength: 16, blockSize: 16, fixedIvLength: 4, recordIvLength: 8, authTagLength: 16 },
    "aes-256-gcm": { interface: node_aead_crypto_1.gcm, keyLength: 16, blockSize: 32, fixedIvLength: 4, recordIvLength: 8, authTagLength: 16 },
};
var AdditionalData = /** @class */ (function (_super) {
    __extends(AdditionalData, _super);
    function AdditionalData(epoch, sequence_number, type, version, fragment_length) {
        var _this = _super.call(this, AdditionalData.__spec) || this;
        _this.epoch = epoch;
        _this.sequence_number = sequence_number;
        _this.type = type;
        _this.version = version;
        _this.fragment_length = fragment_length;
        return _this;
    }
    AdditionalData.createEmpty = function () {
        return new AdditionalData(null, null, null, null, null);
    };
    AdditionalData.__spec = {
        epoch: TypeSpecs.uint16,
        sequence_number: TypeSpecs.uint48,
        type: ContentType_1.ContentType.__spec,
        version: TypeSpecs.define.Struct(ProtocolVersion_1.ProtocolVersion),
        fragment_length: TypeSpecs.uint16,
    };
    return AdditionalData;
}(TLSStruct_1.TLSStruct));
/**
 * Creates an AEAD cipher delegate used to encrypt packet fragments.
 * @param algorithm - The AEAD cipher algorithm to be used
 */
function createCipher(algorithm) {
    var cipherParams = AEADCipherParameters[algorithm];
    var ret = (function (packet, keyMaterial, connEnd) {
        var plaintext = packet.fragment;
        // find the right encryption params
        var salt = (connEnd === "server") ? keyMaterial.server_write_IV : keyMaterial.client_write_IV;
        var nonce_explicit = crypto.pseudoRandomBytes(cipherParams.recordIvLength);
        // alternatively:
        // const nonce_explicit = Buffer.concat([
        // 	BitConverter.numberToBuffer(packet.epoch, 16),
        // 	BitConverter.numberToBuffer(packet.sequence_number, 48)
        // ]);
        var nonce = Buffer.concat([salt, nonce_explicit]);
        var additionalData = new AdditionalData(packet.epoch, packet.sequence_number, packet.type, packet.version, packet.fragment.length).serialize();
        var cipher_key = (connEnd === "server") ? keyMaterial.server_write_key : keyMaterial.client_write_key;
        // Find the right function to encrypt
        var encrypt = cipherParams.interface.encrypt;
        // encrypt and concat the neccessary pieces
        var encryptionResult = encrypt(cipher_key, nonce, plaintext, additionalData, cipherParams.authTagLength);
        var fragment = Buffer.concat([
            nonce_explicit,
            encryptionResult.ciphertext,
            encryptionResult.auth_tag,
        ]);
        // and return the packet
        return new DTLSCiphertext_1.DTLSCiphertext(packet.type, packet.version, packet.epoch, packet.sequence_number, fragment);
    });
    // append key length information
    ret.keyLength = cipherParams.keyLength;
    ret.blockSize = cipherParams.blockSize;
    ret.authTagLength = cipherParams.authTagLength;
    ret.fixedIvLength = cipherParams.fixedIvLength;
    ret.recordIvLength = cipherParams.recordIvLength;
    return ret;
}
exports.createCipher = createCipher;
/**
 * Creates an AEAD cipher delegate used to decrypt packet fragments.
 * @param algorithm - The AEAD cipher algorithm to be used
 */
function createDecipher(algorithm) {
    var decipherParams = AEADCipherParameters[algorithm];
    var ret = (function (packet, keyMaterial, connEnd) {
        var ciphertext = packet.fragment;
        var sourceConnEnd = (connEnd === "client") ? "server" : "client";
        // find the right decryption params
        var salt = (sourceConnEnd === "server") ? keyMaterial.server_write_IV : keyMaterial.client_write_IV;
        var nonce_explicit = ciphertext.slice(0, decipherParams.recordIvLength);
        var nonce = Buffer.concat([salt, nonce_explicit]);
        var additionalData = new AdditionalData(packet.epoch, packet.sequence_number, packet.type, packet.version, 
        // subtract the AEAD overhead from the packet length for authentication
        packet.fragment.length - decipherParams.recordIvLength - decipherParams.authTagLength).serialize();
        var authTag = ciphertext.slice(-decipherParams.authTagLength);
        var decipher_key = (sourceConnEnd === "server") ? keyMaterial.server_write_key : keyMaterial.client_write_key;
        // Find the right function to decrypt
        var decrypt = decipherParams.interface.decrypt;
        // decrypt the ciphertext and check the result
        var ciphered = ciphertext.slice(decipherParams.recordIvLength, -decipherParams.authTagLength);
        var decryptionResult = decrypt(decipher_key, nonce, ciphered, additionalData, authTag);
        if (!decryptionResult.auth_ok) {
            throw new Error("Authenticated decryption of the packet failed.");
        }
        // everything good, return the decrypted packet
        return new DTLSCompressed_1.DTLSCompressed(packet.type, packet.version, packet.epoch, packet.sequence_number, decryptionResult.plaintext);
    });
    // append key length information
    ret.keyLength = decipherParams.keyLength;
    ret.blockSize = decipherParams.blockSize;
    ret.authTagLength = decipherParams.authTagLength;
    ret.fixedIvLength = decipherParams.fixedIvLength;
    ret.recordIvLength = decipherParams.recordIvLength;
    return ret;
}
exports.createDecipher = createDecipher;
