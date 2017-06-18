"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TLSTypes = require("./TLSTypes");
var TLSStruct_1 = require("./TLSStruct");
var ProtocolVersion_1 = require("./ProtocolVersion");
var ContentType_1 = require("./ContentType");
var TLSCiphertext = (function (_super) {
    __extends(TLSCiphertext, _super);
    function TLSCiphertext(type, version, fragment // <XXX>Ciphertext
    ) {
        if (version === void 0) { version = new ProtocolVersion_1.ProtocolVersion(); }
        var _this = _super.call(this, TLSCiphertext.__spec) || this;
        _this.type = type;
        _this.version = version;
        _this.fragment = fragment; // <XXX>Ciphertext
        return _this;
    }
    return TLSCiphertext;
}(TLSStruct_1.TLSStruct));
TLSCiphertext.__spec = {
    type: ContentType_1.ContentType.__spec,
    version: ProtocolVersion_1.ProtocolVersion.__spec,
    length: new TLSTypes.Calculated("uint16", "serializedLength", "fragment"),
    fragment: new TLSTypes.Vector("uint8", 0, 2048 + Math.pow(2, 14))
};
exports.TLSCiphertext = TLSCiphertext;
//# sourceMappingURL=TLSCiphertext.js.map