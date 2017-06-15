"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TLSTypes = require("../lib/TLSTypes");
var TLSStruct_1 = require("../lib/TLSStruct");
var Extension = (function (_super) {
    __extends(Extension, _super);
    function Extension(extension_type, extension_data) {
        var _this = _super.call(this, Extension.__spec) || this;
        _this.extension_type = extension_type;
        _this.extension_data = extension_data;
        return _this;
    }
    return Extension;
}(TLSStruct_1.TLSStruct));
Extension.__spec = {
    extension_type: new TLSTypes.Enum("uint16", ExtensionType),
    extension_data: new TLSTypes.Vector("uint8", 0, Math.pow(2, 16) - 1)
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Extension;
var ExtensionType;
(function (ExtensionType) {
    ExtensionType[ExtensionType["signature_algorithms"] = 13] = "signature_algorithms";
})(ExtensionType = exports.ExtensionType || (exports.ExtensionType = {}));
;
//# sourceMappingURL=Extension.js.map