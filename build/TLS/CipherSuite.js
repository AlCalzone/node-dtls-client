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
var AEADCipher = require("./AEADCipher");
var PRF_1 = require("./PRF");
var DTLSCompressed_1 = require("../DTLS/DTLSCompressed");
var DTLSCiphertext_1 = require("../DTLS/DTLSCiphertext");
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
    ret.keyAndHashLength = MAC.keyAndHashLenth;
    return ret;
}
exports.createMAC = createMAC;
function createNullCipher() {
    var ret = (function (packet, _1, _2) { return new DTLSCiphertext_1.DTLSCiphertext(packet.type, packet.version, packet.epoch, packet.sequence_number, packet.fragment); });
    //const ret = ((plaintext, _1, _2) => Buffer.from(plaintext.fragment)) as GenericCipherDelegate;
    ret.keyLength = 0;
    ret.fixedIvLength = 0;
    ret.recordIvLength = 0;
    return ret;
}
function createNullDecipher() {
    var ret = (function (packet, _1, _2) { return new DTLSCompressed_1.DTLSCompressed(packet.type, packet.version, packet.epoch, packet.sequence_number, packet.fragment); });
    //const ret =  ((ciphertext, _1, _2) => ({ result: Buffer.from(ciphertext) })) as GenericDecipherDelegate;
    ret.keyLength = 0;
    ret.fixedIvLength = 0;
    ret.recordIvLength = 0;
    return ret;
}
function createNullMAC() {
    var ret = (function (data, _1, _2) { return Buffer.from([]); });
    ret.keyAndHashLength = 0;
    return ret;
}
var CipherSuite = (function (_super) {
    __extends(CipherSuite, _super);
    function CipherSuite(id, keyExchange, macAlgorithm, prfAlgorithm, cipherType, algorithm, verify_data_length) {
        if (verify_data_length === void 0) { verify_data_length = 12; }
        var _this = _super.call(this, CipherSuite.__spec) || this;
        _this.id = id;
        _this.keyExchange = keyExchange;
        _this.macAlgorithm = macAlgorithm;
        _this.prfAlgorithm = prfAlgorithm;
        _this.cipherType = cipherType;
        _this.algorithm = algorithm;
        _this.verify_data_length = verify_data_length;
        return _this;
    }
    CipherSuite.createEmpty = function () {
        return new CipherSuite(null, null, null, null, null);
    };
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
        var _this = this;
        var ret = (function () {
            switch (_this.cipherType) {
                case null:
                    return createNullCipher();
                case "block":
                    return BlockCipher.createCipher(_this.algorithm, _this.MAC);
                case "aead":
                    return AEADCipher.createCipher(_this.algorithm);
                default:
                    throw new Error("createCipher not implemented for " + _this.cipherType + " cipher");
            }
        })();
        if (!ret.keyLength)
            ret.keyLength = 0;
        if (!ret.fixedIvLength)
            ret.fixedIvLength = 0;
        if (!ret.recordIvLength)
            ret.recordIvLength = 0;
        return ret;
    };
    CipherSuite.prototype.specifyCipher = function (keyMaterial, connEnd) {
        var _this = this;
        var ret = (function (plaintext) { return _this.Cipher(plaintext, keyMaterial, connEnd); });
        ret.inner = this.Cipher;
        return ret;
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
        var _this = this;
        var ret = (function () {
            switch (_this.cipherType) {
                case null:
                    return createNullDecipher();
                case "block":
                    return BlockCipher.createDecipher(_this.algorithm, _this.MAC);
                case "aead":
                    return AEADCipher.createDecipher(_this.algorithm);
                default:
                    throw new Error("createDecipher not implemented for " + _this.cipherType + " cipher");
            }
        })();
        if (!ret.keyLength)
            ret.keyLength = 0;
        if (!ret.fixedIvLength)
            ret.fixedIvLength = 0;
        if (!ret.recordIvLength)
            ret.recordIvLength = 0;
        return ret;
    };
    CipherSuite.prototype.specifyDecipher = function (keyMaterial, connEnd) {
        var _this = this;
        var ret = (function (packet) { return _this.Decipher(packet, keyMaterial, connEnd); });
        ret.inner = this.Decipher;
        return ret;
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
            case "aead":
                return createNullMAC();
            case "block":
                if (this.macAlgorithm == null)
                    return createNullMAC();
                return createMAC(this.macAlgorithm);
            default:
                throw new Error("createMAC not implemented for " + this.cipherType + " cipher");
        }
    };
    return CipherSuite;
}(TLSStruct_1.TLSStruct));
CipherSuite.__spec = {
    id: TypeSpecs.uint16
};
CipherSuite.spec = TypeSpecs.define.Struct(CipherSuite);
exports.CipherSuite = CipherSuite;
//# sourceMappingURL=CipherSuite.js.map