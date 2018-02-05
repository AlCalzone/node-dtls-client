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
var ContentType_1 = require("../TLS/ContentType");
var ProtocolVersion_1 = require("../TLS/ProtocolVersion");
var TLSStruct_1 = require("../TLS/TLSStruct");
var TypeSpecs = require("../TLS/TypeSpecs");
var DTLSPlaintext = /** @class */ (function (_super) {
    __extends(DTLSPlaintext, _super);
    function DTLSPlaintext(type, version, epoch, sequence_number, fragment) {
        if (version === void 0) { version = new ProtocolVersion_1.ProtocolVersion(); }
        var _this = _super.call(this, DTLSPlaintext.__spec) || this;
        _this.type = type;
        _this.version = version;
        _this.epoch = epoch;
        _this.sequence_number = sequence_number;
        _this.fragment = fragment;
        return _this;
    }
    DTLSPlaintext.createEmpty = function () {
        return new DTLSPlaintext(null, null, null, null, null);
    };
    DTLSPlaintext.__spec = {
        type: TypeSpecs.define.Struct(ContentType_1.ContentType),
        version: TypeSpecs.define.Struct(ProtocolVersion_1.ProtocolVersion),
        epoch: TypeSpecs.uint16,
        sequence_number: TypeSpecs.uint48,
        // length field is implied in the variable length vector
        fragment: TypeSpecs.define.Buffer(0, Math.pow(2, 14)),
    };
    DTLSPlaintext.spec = TypeSpecs.define.Struct(DTLSPlaintext);
    return DTLSPlaintext;
}(TLSStruct_1.TLSStruct));
exports.DTLSPlaintext = DTLSPlaintext;
