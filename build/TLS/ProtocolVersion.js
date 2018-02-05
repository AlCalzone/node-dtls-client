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
// TLS -> Anpassen für DTLS!!!
var ProtocolVersion = /** @class */ (function (_super) {
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
    ProtocolVersion.createEmpty = function () {
        return new ProtocolVersion();
    };
    ProtocolVersion.__spec = {
        major: TypeSpecs.uint8,
        minor: TypeSpecs.uint8,
    };
    return ProtocolVersion;
}(TLSStruct_1.TLSStruct));
exports.ProtocolVersion = ProtocolVersion;
