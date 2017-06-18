"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TLSTypes = require("./TLSTypes");
var TLSStruct_1 = require("./TLSStruct");
var PreMasterSecret = (function (_super) {
    __extends(PreMasterSecret, _super);
    function PreMasterSecret(other_secret, psk) {
        var _this = _super.call(this, PreMasterSecret.__spec) || this;
        _this.other_secret = other_secret;
        _this.psk = psk;
        return _this;
    }
    return PreMasterSecret;
}(TLSStruct_1.TLSStruct));
PreMasterSecret.__spec = {
    other_secret: new TLSTypes.Vector("uint8", 0, Math.pow(2, 16) - 1),
    psk: new TLSTypes.Vector("uint8", 0, Math.pow(2, 16) - 1)
};
exports.PreMasterSecret = PreMasterSecret;
//# sourceMappingURL=PreMasterSecret.js.map