"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TLSStruct_1 = require("./TLSStruct");
var CipherSuite = (function (_super) {
    __extends(CipherSuite, _super);
    function CipherSuite(id, keyExchange, mac, prf, cipherType, algorithm) {
        var _this = _super.call(this, CipherSuite.__spec) || this;
        _this.id = id;
        _this.keyExchange = keyExchange;
        _this.mac = mac;
        _this.prf = prf;
        _this.cipherType = cipherType;
        _this.algorithm = algorithm;
        return _this;
    }
    return CipherSuite;
}(TLSStruct_1.TLSStruct));
CipherSuite.__spec = {
    id: "uint16"
};
exports.CipherSuite = CipherSuite;
//# sourceMappingURL=CipherSuite.js.map