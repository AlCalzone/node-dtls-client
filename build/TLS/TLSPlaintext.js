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
var TLSPlaintext = (function (_super) {
    __extends(TLSPlaintext, _super);
    function TLSPlaintext(type, version, fragment) {
        if (version === void 0) { version = new ProtocolVersion_1.ProtocolVersion(); }
        var _this = _super.call(this, TLSPlaintext.__spec) || this;
        _this.type = type;
        _this.version = version;
        _this.fragment = fragment;
        return _this;
    }
    return TLSPlaintext;
}(TLSStruct_1.TLSStruct));
TLSPlaintext.__spec = {
    type: ContentType_1.ContentType.__spec,
    version: ProtocolVersion_1.ProtocolVersion.__spec,
    length: new TLSTypes.Calculated("uint16", "serializedLength", "fragment"),
    fragment: new TLSTypes.Vector("uint8", 0, Math.pow(2, 14))
};
exports.TLSPlaintext = TLSPlaintext;
//# sourceMappingURL=TLSPlaintext.js.map