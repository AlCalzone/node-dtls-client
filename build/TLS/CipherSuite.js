"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TLSStruct_1 = require("./TLSStruct");
var object_polyfill_1 = require("../lib/object-polyfill");
/**
 * The length of encryption keys and block size for each algorithm in bytes
 */
var BulkCipherParameters = {
    "aes-128-cbc": { keyLength: 16, blockSize: 16 },
    "aes-256-cbc": { keyLength: 16, blockSize: 16 },
    "des-ede3-cbc": { keyLength: 24, blockSize: 16 },
};
/**
 * The length of MAC keys for each algorithm in bytes
 */
var MACKeyLengths = {
    md5: 16,
    sha1: 20,
    sha256: 32,
    sha384: 48,
    sha512: 64
};
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
        // Initialwerte für Schlüssellängen etc. merken
        switch (_this.cipherType) {
            case "block":
                _this.keyLengths = object_polyfill_1.extend(BulkCipherParameters[algorithm], { macLength: MACKeyLengths[mac] });
                break;
        }
        return _this;
    }
    return CipherSuite;
}(TLSStruct_1.TLSStruct));
CipherSuite.__spec = {
    id: "uint16"
};
exports.CipherSuite = CipherSuite;
//# sourceMappingURL=CipherSuite.js.map