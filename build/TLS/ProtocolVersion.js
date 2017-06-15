"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TLSStruct_1 = require("./TLSStruct");
// TLS -> Anpassen für DTLS!!!
var ProtocolVersion = (function (_super) {
    __extends(ProtocolVersion, _super);
    /**
     *
     * @param major - Hauptversionsnummer
     * @param minor - Nebenversionsnummer
     */
    function ProtocolVersion(major, minor) {
        if (major === void 0) { major = 0; }
        if (minor === void 0) { minor = 0; }
        var _this = _super.call(this, ProtocolVersion.__spec) || this;
        _this.major = major;
        _this.minor = minor;
        return _this;
    }
    return ProtocolVersion;
}(TLSStruct_1.TLSStruct));
ProtocolVersion.__spec = {
    major: "uint8",
    minor: "uint8"
};
exports.ProtocolVersion = ProtocolVersion;
//# sourceMappingURL=ProtocolVersion.js.map