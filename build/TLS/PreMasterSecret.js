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
var PreMasterSecret = (function (_super) {
    __extends(PreMasterSecret, _super);
    function PreMasterSecret(other_secret, psk) {
        var _this = _super.call(this, PreMasterSecret.__spec) || this;
        _this.other_secret = other_secret;
        _this.psk = psk;
        if (_this.other_secret == null) {
            // create fake contents
            _this.other_secret = Buffer.alloc(_this.psk.length, 0);
        }
        return _this;
    }
    PreMasterSecret.createEmpty = function () {
        return new PreMasterSecret(null, null);
    };
    return PreMasterSecret;
}(TLSStruct_1.TLSStruct));
PreMasterSecret.__spec = {
    other_secret: TypeSpecs.define.Buffer(0, Math.pow(2, 16) - 1),
    psk: TypeSpecs.define.Buffer(0, Math.pow(2, 16) - 1),
};
exports.PreMasterSecret = PreMasterSecret;
//# sourceMappingURL=PreMasterSecret.js.map