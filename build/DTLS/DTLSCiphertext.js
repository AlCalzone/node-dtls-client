"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TLSTypes = require("../TLS/TLSTypes");
var TLSStruct_1 = require("../TLS/TLSStruct");
var ProtocolVersion_1 = require("../TLS/ProtocolVersion");
var ContentType_1 = require("../TLS/ContentType");
var DTLSCiphertext = (function (_super) {
    __extends(DTLSCiphertext, _super);
    function DTLSCiphertext(type, version, epoch, sequence_number, fragment // <XXX>Ciphertext
    ) {
        if (version === void 0) { version = new ProtocolVersion_1.ProtocolVersion(); }
        var _this = _super.call(this, DTLSCiphertext.__spec) || this;
        _this.type = type;
        _this.version = version;
        _this.epoch = epoch;
        _this.sequence_number = sequence_number;
        _this.fragment = fragment; // <XXX>Ciphertext
        return _this;
    }
    return DTLSCiphertext;
}(TLSStruct_1.TLSStruct));
DTLSCiphertext.__spec = {
    type: ContentType_1.ContentType.__spec,
    version: ProtocolVersion_1.ProtocolVersion.__spec,
    epoch: "uint16",
    sequence_number: "uint48",
    length: new TLSTypes.Calculated("uint16", "serializedLength", "fragment"),
    fragment: new TLSTypes.Vector("uint8", 0, 2048 + Math.pow(2, 14))
};
exports.DTLSCiphertext = DTLSCiphertext;
//# sourceMappingURL=DTLSCiphertext.js.map