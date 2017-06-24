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
var ExtensionType;
(function (ExtensionType) {
    ExtensionType[ExtensionType["signature_algorithms"] = 13] = "signature_algorithms";
})(ExtensionType = exports.ExtensionType || (exports.ExtensionType = {}));
;
(function (ExtensionType) {
    ExtensionType.__spec = TypeSpecs.define.Enum("uint16", ExtensionType);
})(ExtensionType = exports.ExtensionType || (exports.ExtensionType = {}));
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
    extension_type: ExtensionType.__spec,
    extension_data: TypeSpecs.define.Vector(TypeSpecs.uint8, 0, Math.pow(2, 16) - 1)
};
exports.default = Extension;
//# sourceMappingURL=Extension.js.map