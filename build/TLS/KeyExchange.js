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
var ServerKeyExchange = (function (_super) {
    __extends(ServerKeyExchange, _super);
    function ServerKeyExchange(algorithm) {
        var _this = _super.call(this, ServerKeyExchange.__specs[algorithm]) || this;
        _this.algorithm = algorithm;
        return _this;
    }
    return ServerKeyExchange;
}(TLSStruct_1.TLSStruct));
ServerKeyExchange.__specs = {
    psk: {
        psk_identity_hint: TypeSpecs.define.Vector(TypeSpecs.define.Number("uint8"), 0, Math.pow(2, 16) - 1)
    }
};
exports.ServerKeyExchange = ServerKeyExchange;
var ClientKeyExchange = (function (_super) {
    __extends(ClientKeyExchange, _super);
    function ClientKeyExchange(algorithm) {
        var _this = _super.call(this, ClientKeyExchange.__specs[algorithm]) || this;
        _this.algorithm = algorithm;
        return _this;
    }
    return ClientKeyExchange;
}(TLSStruct_1.TLSStruct));
ClientKeyExchange.__specs = {
    psk: {
        psk_identity: TypeSpecs.define.Vector(TypeSpecs.define.Number("uint8"), 0, Math.pow(2, 16) - 1)
    }
};
exports.ClientKeyExchange = ClientKeyExchange;
//# sourceMappingURL=KeyExchange.js.map