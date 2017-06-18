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
var TLSCompressed = (function (_super) {
    __extends(TLSCompressed, _super);
    function TLSCompressed(type, version, fragment) {
        if (version === void 0) { version = new ProtocolVersion_1.ProtocolVersion(); }
        var _this = _super.call(this, TLSCompressed.__spec) || this;
        _this.type = type;
        _this.version = version;
        _this.fragment = fragment;
        return _this;
    }
    return TLSCompressed;
}(TLSStruct_1.TLSStruct));
TLSCompressed.__spec = {
    type: ContentType_1.ContentType.__spec,
    version: ProtocolVersion_1.ProtocolVersion.__spec,
    length: new TLSTypes.Calculated("uint16", "serializedLength", "fragment"),
    fragment: new TLSTypes.Vector("uint8", 0, 1024 + Math.pow(2, 14))
};
exports.TLSCompressed = TLSCompressed;
//# sourceMappingURL=TLSCompressed.js.map