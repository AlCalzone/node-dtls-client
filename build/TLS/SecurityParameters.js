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
    return SecurityParameters;
}());
exports.SecurityParameters = SecurityParameters;
//# sourceMappingURL=SecurityParameters.js.map