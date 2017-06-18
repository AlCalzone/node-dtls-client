"use strict";
var TLSTypes = require("./TLSTypes");
var object_polyfill_1 = require("../lib/object-polyfill");
var PRF_1 = require("./PRF");
var CompressionMethod;
(function (CompressionMethod) {
    CompressionMethod[CompressionMethod["null"] = 0] = "null";
})(CompressionMethod = exports.CompressionMethod || (exports.CompressionMethod = {}));
(function (CompressionMethod) {
    CompressionMethod.__spec = new TLSTypes.Enum("uint8", CompressionMethod);
})(CompressionMethod = exports.CompressionMethod || (exports.CompressionMethod = {}));
var master_secret_length = 48;
var client_random_length = 32;
var server_random_length = 32;
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
var SecurityParameters = (function () {
    function SecurityParameters(values) {
        for (var _i = 0, _a = object_polyfill_1.entries(values); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (this.hasOwnProperty(key))
                this[key] = value;
        }
    }
    // TODO: Gehört das wirklich hier hin?
    /**
     * Compute the master secret from a given premaster secret
     * @param preMasterSecret - The secret used to calculate the master secret
     * @param clientHelloRandom - The random data from the client hello message
     * @param serverHelloRandom - The random data from the server hello message
     */
    SecurityParameters.prototype.computeMasterSecret = function (preMasterSecret, clientHelloRandom, serverHelloRandom) {
        this.master_secret = PRF_1.PRF[this.prf_algorithm](preMasterSecret.serialize(), "master secret", Buffer.concat([clientHelloRandom, serverHelloRandom]), master_secret_length);
    };
    /**
     * Berechnet die Schlüsselkomponenten
     */
    SecurityParameters.prototype.computeKeyMaterial = function () {
        var keyBlock = PRF_1.PRF[this.prf_algorithm](this.master_secret, "key expansion", Buffer.concat([this.server_random, this.client_random]), 2 * (this.mac_key_length + this.enc_key_length + this.fixed_iv_length));
        var offset = 0;
        function read(length) {
            var ret = keyBlock.slice(offset, offset + length);
            offset += length;
            return ret;
        }
        this.client_write_MAC_key = read(this.mac_key_length);
        this.server_write_MAC_key = read(this.mac_key_length);
        this.client_write_key = read(this.enc_key_length);
        this.server_write_key = read(this.enc_key_length);
        this.client_write_IV = read(this.fixed_iv_length);
        this.server_write_IV = read(this.fixed_iv_length);
    };
    return SecurityParameters;
}());
exports.SecurityParameters = SecurityParameters;
//# sourceMappingURL=SecurityParameters.js.map