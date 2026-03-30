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
exports.PreMasterSecret = void 0;
const TLSStruct_1 = require("./TLSStruct");
const TypeSpecs = __importStar(require("./TypeSpecs"));
class PreMasterSecret extends TLSStruct_1.TLSStruct {
    other_secret;
    psk;
    static __spec = {
        other_secret: TypeSpecs.define.Buffer(0, 2 ** 16 - 1),
        psk: TypeSpecs.define.Buffer(0, 2 ** 16 - 1),
    };
    constructor(other_secret, psk) {
        super(PreMasterSecret.__spec);
        this.other_secret = other_secret;
        this.psk = psk;
        if (this.other_secret == null) {
            // create fake contents
            this.other_secret = Buffer.alloc(this.psk.length, 0);
        }
    }
    static createEmpty() {
        return new PreMasterSecret(null, null);
    }
}
exports.PreMasterSecret = PreMasterSecret;
