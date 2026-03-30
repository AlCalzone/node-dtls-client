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
exports.Random = void 0;
const crypto = __importStar(require("crypto"));
const TLSStruct_1 = require("./TLSStruct");
const TypeSpecs = __importStar(require("./TypeSpecs"));
class Random extends TLSStruct_1.TLSStruct {
    gmt_unix_time;
    random_bytes;
    static __spec = {
        gmt_unix_time: TypeSpecs.uint32,
        random_bytes: TypeSpecs.define.Buffer(28),
    };
    constructor(gmt_unix_time, random_bytes) {
        super(Random.__spec);
        this.gmt_unix_time = gmt_unix_time;
        this.random_bytes = random_bytes;
    }
    /**
     * Creates a new Random structure and initializes it.
     */
    static createNew() {
        return new Random(Math.floor(Date.now() / 1000), crypto.randomBytes(Random.__spec.random_bytes.maxLength));
    }
    static createEmpty() {
        return new Random(null, null);
    }
}
exports.Random = Random;
