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
var HashAlgorithm;
(function (HashAlgorithm) {
    HashAlgorithm[HashAlgorithm["none"] = 0] = "none";
    HashAlgorithm[HashAlgorithm["md5"] = 1] = "md5";
    HashAlgorithm[HashAlgorithm["sha1"] = 2] = "sha1";
    HashAlgorithm[HashAlgorithm["sha224"] = 3] = "sha224";
    HashAlgorithm[HashAlgorithm["sha256"] = 4] = "sha256";
    HashAlgorithm[HashAlgorithm["sha384"] = 5] = "sha384";
    HashAlgorithm[HashAlgorithm["sha512"] = 6] = "sha512";
})(HashAlgorithm = exports.HashAlgorithm || (exports.HashAlgorithm = {}));
(function (HashAlgorithm) {
    HashAlgorithm.__spec = TypeSpecs.define.Enum("uint8", HashAlgorithm);
})(HashAlgorithm = exports.HashAlgorithm || (exports.HashAlgorithm = {}));
var SignatureAlgorithm;
(function (SignatureAlgorithm) {
    SignatureAlgorithm[SignatureAlgorithm["anonymous"] = 0] = "anonymous";
    SignatureAlgorithm[SignatureAlgorithm["rsa"] = 1] = "rsa";
    SignatureAlgorithm[SignatureAlgorithm["dsa"] = 2] = "dsa";
    SignatureAlgorithm[SignatureAlgorithm["ecdsa"] = 3] = "ecdsa";
})(SignatureAlgorithm = exports.SignatureAlgorithm || (exports.SignatureAlgorithm = {}));
(function (SignatureAlgorithm) {
    SignatureAlgorithm.__spec = TypeSpecs.define.Enum("uint8", SignatureAlgorithm);
})(SignatureAlgorithm = exports.SignatureAlgorithm || (exports.SignatureAlgorithm = {}));
var SignatureAndHashAlgorithm = /** @class */ (function (_super) {
    __extends(SignatureAndHashAlgorithm, _super);
    function SignatureAndHashAlgorithm(hash, signature) {
        var _this = _super.call(this, SignatureAndHashAlgorithm.__spec) || this;
        _this.hash = hash;
        _this.signature = signature;
        return _this;
    }
    SignatureAndHashAlgorithm.createEmpty = function () {
        return new SignatureAndHashAlgorithm(null, null);
    };
    SignatureAndHashAlgorithm.__spec = {
        hash: HashAlgorithm.__spec,
        signature: SignatureAlgorithm.__spec,
    };
    return SignatureAndHashAlgorithm;
}(TLSStruct_1.TLSStruct));
exports.default = SignatureAndHashAlgorithm;
