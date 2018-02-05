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
var TypeSpecs = require("./TypeSpecs");
var ExtensionType;
(function (ExtensionType) {
    ExtensionType[ExtensionType["signature_algorithms"] = 13] = "signature_algorithms";
})(ExtensionType = exports.ExtensionType || (exports.ExtensionType = {}));
(function (ExtensionType) {
    ExtensionType.spec = TypeSpecs.define.Enum("uint16", ExtensionType);
})(ExtensionType = exports.ExtensionType || (exports.ExtensionType = {}));
var Extension = /** @class */ (function (_super) {
    __extends(Extension, _super);
    function Extension(extension_type, extension_data) {
        var _this = _super.call(this, Extension.__spec) || this;
        _this.extension_type = extension_type;
        _this.extension_data = extension_data;
        return _this;
    }
    Extension.createEmpty = function () {
        return new Extension(null, null);
    };
    Extension.__spec = {
        extension_type: ExtensionType.spec,
        extension_data: TypeSpecs.define.Buffer(0, Math.pow(2, 16) - 1),
    };
    Extension.spec = TypeSpecs.define.Struct(Extension);
    return Extension;
}(TLSStruct_1.TLSStruct));
exports.Extension = Extension;
