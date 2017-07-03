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
var TypeSpecs = require("./TypeSpecs");
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
 */
function createMAC(algorithm) {
    //const keyLength = MACKeyLengths[algorithm];
    var MAC = PRF_1.HMAC[algorithm];
    var ret = (function (data, keyMaterial, sourceConnEnd) {
        // find the right hash params
        var mac_key = (sourceConnEnd === "server") ? keyMaterial.server_write_MAC_key : keyMaterial.client_write_MAC_key;
        // and return the hash
        return MAC(mac_key, data);
    });
    // append length information
    ret.length = MAC.length;
    return ret;
}
exports.createMAC = createMAC;
function createNullCipher() {
    var ret = (function (plaintext, _1, _2) { return Buffer.from(plaintext); });
    ret.keyLength = 0;
    ret.recordIvLength = 0;
    return ret;
}
function createNullDecipher() {
    var ret = (function (ciphertext, _1, _2) { return ({ result: Buffer.from(ciphertext) }); });
    ret.keyLength = 0;
    ret.recordIvLength = 0;
    return ret;
}
function createNullMAC() {
    var ret = (function (data) { return Buffer.from(data); });
    ret.length = 0;
    return ret;
}
var CipherSuite = (function (_super) {
    __extends(CipherSuite, _super);
    function CipherSuite(id, keyExchange, macAlgorithm, prfAlgorithm, cipherType, algorithm) {
        var _this = _super.call(this, CipherSuite.__spec) || this;
        _this.id = id;
        _this.keyExchange = keyExchange;
        _this.macAlgorithm = macAlgorithm;
        _this.prfAlgorithm = prfAlgorithm;
        _this.cipherType = cipherType;
        _this.algorithm = algorithm;
        return _this;
    }
    Object.defineProperty(CipherSuite.prototype, "Cipher", {
        get: function () {
            if (this._cipher == undefined)
                this._cipher = this.createCipher();
            return this._cipher;
        },
        enumerable: true,
        configurable: true
    });
    CipherSuite.prototype.createCipher = function () {
        switch (this.cipherType) {
            case null:
                return createNullCipher();
            case "block":
                return BlockCipher.createCipher(this.algorithm);
        }
    };
    CipherSuite.prototype.specifyCipher = function (keyMaterial, connEnd) {
        var _this = this;
        return function (plaintext) { return _this.Cipher(plaintext, keyMaterial, connEnd); };
    };
    Object.defineProperty(CipherSuite.prototype, "Decipher", {
        get: function () {
            if (this._decipher == undefined)
                this._decipher = this.createDecipher();
            return this._decipher;
        },
        enumerable: true,
        configurable: true
    });
    CipherSuite.prototype.createDecipher = function () {
        switch (this.cipherType) {
            case null:
                return createNullDecipher();
            case "block":
                return BlockCipher.createDecipher(this.algorithm);
        }
    };
    CipherSuite.prototype.specifyDecipher = function (keyMaterial, connEnd) {
        var _this = this;
        return function (plaintext) { return _this.Decipher(plaintext, keyMaterial, connEnd); };
    };
    Object.defineProperty(CipherSuite.prototype, "MAC", {
        get: function () {
            if (this._mac == undefined)
                this._mac = this.createMAC();
            return this._mac;
        },
        enumerable: true,
        configurable: true
    });
    CipherSuite.prototype.createMAC = function () {
        // TODO: detect special cases
        switch (this.cipherType) {
            case null:
                return createNullMAC();
            case "stream":
            case "block":
                if (this.macAlgorithm == null)
                    return createNullMAC();
                return createMAC(this.macAlgorithm);
        }
    };
    CipherSuite.prototype.specifyMAC = function (keyMaterial, sourceConnEnd) {
        var _this = this;
        return function (data) { return _this.MAC(data, keyMaterial, sourceConnEnd); };
    };
    return CipherSuite;
}(TLSStruct_1.TLSStruct));
CipherSuite.__spec = {
    id: TypeSpecs.uint16
};
CipherSuite.spec = TypeSpecs.define.Struct(CipherSuite);
exports.CipherSuite = CipherSuite;
//# sourceMappingURL=CipherSuite.js.map