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
var TLSStruct_1 = require("./TLSStruct");
var BlockCipher = require("./BlockCipher");
var PRF_1 = require("./PRF");
var AEADAlgorithm;
(function (AEADAlgorithm) {
    // ...
    // from https://tools.ietf.org/html/rfc5116#section-6
    AEADAlgorithm[AEADAlgorithm["AES_128_CCM"] = 3] = "AES_128_CCM";
    AEADAlgorithm[AEADAlgorithm["AES_256_CCM"] = 4] = "AES_256_CCM";
    // ...
    // from https://tools.ietf.org/html/rfc6655#section-6
    AEADAlgorithm[AEADAlgorithm["AES_128_CCM_8"] = 18] = "AES_128_CCM_8";
    AEADAlgorithm[AEADAlgorithm["AES_256_CCM_8"] = 19] = "AES_256_CCM_8";
})(AEADAlgorithm = exports.AEADAlgorithm || (exports.AEADAlgorithm = {}));
/**
 * Creates a block cipher delegate used to encrypt packet fragments.
 * @param algorithm - The block cipher algorithm to be used
 * @param sourceConnEnd - Denotes which connection end the packet is coming from
 * @param keyMaterial - The key material (mac and encryption keys and IVs) used in the encryption
 */
function createMAC(algorithm, sourceConnEnd, keyMaterial) {
    // find the right hash params
    var mac_key = (sourceConnEnd === "server") ? keyMaterial.server_write_MAC_key : keyMaterial.client_write_MAC_key;
    //const keyLength = MACKeyLengths[algorithm];
    var MAC = PRF_1.HMAC[algorithm];
    var ret = (function (data) { return MAC(mac_key, data); });
    ret.length = MAC.length;
    return ret;
}
exports.createMAC = createMAC;
function createNullCipher() {
    return function (plaintext) { return Buffer.from(plaintext); };
}
function createNullDecipher() {
    return function (ciphertext) { return ({ result: Buffer.from(ciphertext) }); };
}
function createNullMAC() {
    var ret = (function (data) { return Buffer.from(data); });
    ret.length = 0;
    return ret;
}
var CipherSuite = (function (_super) {
    __extends(CipherSuite, _super);
    function CipherSuite(id, keyExchange, mac, prf, cipherType, algorithm) {
        var _this = _super.call(this, CipherSuite.__spec) || this;
        _this.id = id;
        _this.keyExchange = keyExchange;
        _this.mac = mac;
        _this.prf = prf;
        _this.cipherType = cipherType;
        _this.algorithm = algorithm;
        return _this;
    }
    CipherSuite.prototype.createCipher = function (connEnd, keyMaterial) {
        switch (this.cipherType) {
            case null:
                return createNullCipher();
            case "block":
                return BlockCipher.createCipher(this.algorithm, connEnd, keyMaterial);
        }
    };
    CipherSuite.prototype.createDecipher = function (connEnd, keyMaterial) {
        switch (this.cipherType) {
            case null:
                return createNullDecipher();
            case "block":
                return BlockCipher.createDecipher(this.algorithm, connEnd, keyMaterial);
        }
    };
    CipherSuite.prototype.createMAC = function (sourceConnEnd, keyMaterial) {
        // TODO: detect special cases
        switch (this.cipherType) {
            case null:
                return createNullMAC();
            case "stream":
            case "block":
                if (this.mac == null)
                    return createNullMAC();
                return createMAC(this.mac, sourceConnEnd, keyMaterial);
        }
    };
    return CipherSuite;
}(TLSStruct_1.TLSStruct));
CipherSuite.__spec = {
    id: "uint16"
};
exports.CipherSuite = CipherSuite;
//# sourceMappingURL=CipherSuite.js.map