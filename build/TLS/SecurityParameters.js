"use strict";
var TLSTypes = require("./TLSTypes");
var object_polyfill_1 = require("../lib/object-polyfill");
var CompressionMethod;
(function (CompressionMethod) {
    CompressionMethod[CompressionMethod["null"] = 0] = "null";
})(CompressionMethod = exports.CompressionMethod || (exports.CompressionMethod = {}));
(function (CompressionMethod) {
    CompressionMethod.__spec = new TLSTypes.Enum("uint8", CompressionMethod);
})(CompressionMethod = exports.CompressionMethod || (exports.CompressionMethod = {}));
var ConnectionEnd;
(function (ConnectionEnd) {
    ConnectionEnd[ConnectionEnd["server"] = 0] = "server";
    ConnectionEnd[ConnectionEnd["client"] = 1] = "client";
})(ConnectionEnd = exports.ConnectionEnd || (exports.ConnectionEnd = {}));
var PRFAlgorithm;
(function (PRFAlgorithm) {
    PRFAlgorithm[PRFAlgorithm["tls_prf_sha256"] = 0] = "tls_prf_sha256";
})(PRFAlgorithm = exports.PRFAlgorithm || (exports.PRFAlgorithm = {}));
var BulkCipherAlgorithm;
(function (BulkCipherAlgorithm) {
    BulkCipherAlgorithm[BulkCipherAlgorithm["null"] = 0] = "null";
    BulkCipherAlgorithm[BulkCipherAlgorithm["rc4"] = 1] = "rc4";
    BulkCipherAlgorithm[BulkCipherAlgorithm["_3des"] = 2] = "_3des";
    BulkCipherAlgorithm[BulkCipherAlgorithm["aes"] = 3] = "aes";
})(BulkCipherAlgorithm = exports.BulkCipherAlgorithm || (exports.BulkCipherAlgorithm = {}));
var CipherType;
(function (CipherType) {
    CipherType[CipherType["stream"] = 0] = "stream";
    CipherType[CipherType["block"] = 1] = "block";
    CipherType[CipherType["aead"] = 2] = "aead";
})(CipherType = exports.CipherType || (exports.CipherType = {}));
var MACAlgorithm;
(function (MACAlgorithm) {
    MACAlgorithm[MACAlgorithm["null"] = 0] = "null";
    MACAlgorithm[MACAlgorithm["hmac_md5"] = 1] = "hmac_md5";
    MACAlgorithm[MACAlgorithm["hmac_sha1"] = 2] = "hmac_sha1";
    MACAlgorithm[MACAlgorithm["hmac_sha256"] = 3] = "hmac_sha256";
    MACAlgorithm[MACAlgorithm["hmac_sha384"] = 4] = "hmac_sha384";
    MACAlgorithm[MACAlgorithm["hmac_sha512"] = 5] = "hmac_sha512";
})(MACAlgorithm = exports.MACAlgorithm || (exports.MACAlgorithm = {}));
var SecurityParameters = (function () {
    function SecurityParameters(values) {
        for (var _i = 0, _a = object_polyfill_1.entries(values); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (this.hasOwnProperty(key))
                this[key] = value;
        }
    }
    return SecurityParameters;
}());
exports.SecurityParameters = SecurityParameters;
//# sourceMappingURL=SecurityParameters.js.map