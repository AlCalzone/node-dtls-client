"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureAlgorithm = exports.HashAlgorithm = void 0;
const TLSStruct_1 = require("./TLSStruct");
const TypeSpecs = __importStar(require("./TypeSpecs"));
var HashAlgorithm;
(function (HashAlgorithm) {
    HashAlgorithm[HashAlgorithm["none"] = 0] = "none";
    HashAlgorithm[HashAlgorithm["md5"] = 1] = "md5";
    HashAlgorithm[HashAlgorithm["sha1"] = 2] = "sha1";
    HashAlgorithm[HashAlgorithm["sha224"] = 3] = "sha224";
    HashAlgorithm[HashAlgorithm["sha256"] = 4] = "sha256";
    HashAlgorithm[HashAlgorithm["sha384"] = 5] = "sha384";
    HashAlgorithm[HashAlgorithm["sha512"] = 6] = "sha512";
})(HashAlgorithm || (exports.HashAlgorithm = HashAlgorithm = {}));
(function (HashAlgorithm) {
    HashAlgorithm.__spec = TypeSpecs.define.Enum("uint8", HashAlgorithm);
})(HashAlgorithm || (exports.HashAlgorithm = HashAlgorithm = {}));
var SignatureAlgorithm;
(function (SignatureAlgorithm) {
    SignatureAlgorithm[SignatureAlgorithm["anonymous"] = 0] = "anonymous";
    SignatureAlgorithm[SignatureAlgorithm["rsa"] = 1] = "rsa";
    SignatureAlgorithm[SignatureAlgorithm["dsa"] = 2] = "dsa";
    SignatureAlgorithm[SignatureAlgorithm["ecdsa"] = 3] = "ecdsa";
})(SignatureAlgorithm || (exports.SignatureAlgorithm = SignatureAlgorithm = {}));
(function (SignatureAlgorithm) {
    SignatureAlgorithm.__spec = TypeSpecs.define.Enum("uint8", SignatureAlgorithm);
})(SignatureAlgorithm || (exports.SignatureAlgorithm = SignatureAlgorithm = {}));
class SignatureAndHashAlgorithm extends TLSStruct_1.TLSStruct {
    hash;
    signature;
    static __spec = {
        hash: HashAlgorithm.__spec,
        signature: SignatureAlgorithm.__spec,
    };
    constructor(hash, signature) {
        super(SignatureAndHashAlgorithm.__spec);
        this.hash = hash;
        this.signature = signature;
    }
    static createEmpty() {
        return new SignatureAndHashAlgorithm(null, null);
    }
}
exports.default = SignatureAndHashAlgorithm;
