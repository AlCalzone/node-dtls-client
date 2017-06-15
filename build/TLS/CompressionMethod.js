"use strict";
var TLSTypes = require("./TLSTypes");
var CompressionMethod;
(function (CompressionMethod) {
    CompressionMethod[CompressionMethod["none"] = 0] = "none";
})(CompressionMethod = exports.CompressionMethod || (exports.CompressionMethod = {}));
(function (CompressionMethod) {
    CompressionMethod.__spec = new TLSTypes.Enum("uint8", CompressionMethod);
})(CompressionMethod = exports.CompressionMethod || (exports.CompressionMethod = {}));
//# sourceMappingURL=CompressionMethod.js.map