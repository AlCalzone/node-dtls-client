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
exports.DTLSPlaintext = void 0;
const ContentType_1 = require("../TLS/ContentType");
const ProtocolVersion_1 = require("../TLS/ProtocolVersion");
const TLSStruct_1 = require("../TLS/TLSStruct");
const TypeSpecs = __importStar(require("../TLS/TypeSpecs"));
class DTLSPlaintext extends TLSStruct_1.TLSStruct {
    type;
    version;
    epoch;
    sequence_number;
    fragment;
    static __spec = {
        type: TypeSpecs.define.Struct(ContentType_1.ContentType),
        version: TypeSpecs.define.Struct(ProtocolVersion_1.ProtocolVersion),
        epoch: TypeSpecs.uint16,
        sequence_number: TypeSpecs.uint48,
        // length field is implied in the variable length vector
        fragment: TypeSpecs.define.Buffer(0, 2 ** 14),
    };
    static spec = TypeSpecs.define.Struct(DTLSPlaintext);
    constructor(type, version = new ProtocolVersion_1.ProtocolVersion(), epoch, sequence_number, fragment) {
        super(DTLSPlaintext.__spec);
        this.type = type;
        this.version = version;
        this.epoch = epoch;
        this.sequence_number = sequence_number;
        this.fragment = fragment;
    }
    static createEmpty() {
        return new DTLSPlaintext(null, null, null, null, null);
    }
}
exports.DTLSPlaintext = DTLSPlaintext;
