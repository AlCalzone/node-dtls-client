"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TLSTypes = require("../lib/TLSTypes");
var TLSStruct_1 = require("../lib/TLSStruct");
var CipherSuite = (function (_super) {
    __extends(CipherSuite, _super);
    function CipherSuite(value) {
        if (value === void 0) { value = [0, 0]; }
        var _this = _super.call(this, CipherSuite.__spec) || this;
        _this.value = value;
        return _this;
    }
    return CipherSuite;
}(TLSStruct_1.TLSStruct));
CipherSuite.__spec = {
    value: new TLSTypes.Vector("uint8", 2)
};
exports.CipherSuite = CipherSuite;
//# sourceMappingURL=CipherSuite.js.map