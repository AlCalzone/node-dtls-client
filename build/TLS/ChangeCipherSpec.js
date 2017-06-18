"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TLSTypes = require("./TLSTypes");
var TLSStruct_1 = require("./TLSStruct");
var ChangeCipherSpec = (function (_super) {
    __extends(ChangeCipherSpec, _super);
    function ChangeCipherSpec(type) {
        var _this = _super.call(this, ChangeCipherSpec.__spec) || this;
        _this.type = type;
        return _this;
    }
    return ChangeCipherSpec;
}(TLSStruct_1.TLSStruct));
ChangeCipherSpec.__spec = {
    type: new TLSTypes.Enum("uint8", ChangeCipherSpec)
};
exports.ChangeCipherSpec = ChangeCipherSpec;
var ChangeCipherSpecTypes;
(function (ChangeCipherSpecTypes) {
    ChangeCipherSpecTypes[ChangeCipherSpecTypes["change_cipher_spec"] = 1] = "change_cipher_spec";
})(ChangeCipherSpecTypes = exports.ChangeCipherSpecTypes || (exports.ChangeCipherSpecTypes = {}));
;
(function (ChangeCipherSpecTypes) {
    ChangeCipherSpecTypes.__spec = new TLSTypes.Enum("uint8", ChangeCipherSpecTypes);
})(ChangeCipherSpecTypes = exports.ChangeCipherSpecTypes || (exports.ChangeCipherSpecTypes = {}));
//# sourceMappingURL=ChangeCipherSpec.js.map