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
exports.MACHeader = exports.DTLSCompressed = void 0;
const ContentType_1 = require("../TLS/ContentType");
const ProtocolVersion_1 = require("../TLS/ProtocolVersion");
const TLSStruct_1 = require("../TLS/TLSStruct");
const TypeSpecs = __importStar(require("../TLS/TypeSpecs"));
const DTLSPlaintext_1 = require("./DTLSPlaintext");
class DTLSCompressed extends TLSStruct_1.TLSStruct {
    type;
    version;
    epoch;
    sequence_number;
    fragment;
    static __spec = {
        type: ContentType_1.ContentType.__spec,
        version: TypeSpecs.define.Struct(ProtocolVersion_1.ProtocolVersion),
        epoch: TypeSpecs.uint16,
        sequence_number: TypeSpecs.uint48,
        // length field is implied in the variable length vector
        fragment: TypeSpecs.define.Buffer(0, 1024 + 2 ** 14),
    };
    static spec = TypeSpecs.define.Struct(DTLSCompressed);
    constructor(type, version = new ProtocolVersion_1.ProtocolVersion(), epoch, sequence_number, fragment) {
        super(DTLSCompressed.__spec);
        this.type = type;
        this.version = version;
        this.epoch = epoch;
        this.sequence_number = sequence_number;
        this.fragment = fragment;
    }
    static createEmpty() {
        return new DTLSCompressed(null, null, null, null, null);
    }
    /**
     * Compresses the given plaintext packet
     * @param packet - The plaintext packet to be compressed
     * @param compressor - The compressor function used to compress the given packet
     */
    static compress(packet, compressor) {
        return new DTLSCompressed(packet.type, packet.version, packet.epoch, packet.sequence_number, compressor(packet.fragment));
    }
    /**
     * Decompresses this packet into a plaintext packet
     * @param decompressor - The decompressor function used to decompress this packet
     */
    decompress(decompressor) {
        return new DTLSPlaintext_1.DTLSPlaintext(this.type, this.version, this.epoch, this.sequence_number, decompressor(this.fragment));
    }
    /**
     * Computes the MAC header representing this packet. The MAC header is the input buffer of the MAC calculation minus the actual fragment buffer.
     */
    computeMACHeader() {
        return (new MACHeader(this.epoch, this.sequence_number, this.type, this.version, this.fragment.length)).serialize();
    }
}
exports.DTLSCompressed = DTLSCompressed;
class MACHeader extends TLSStruct_1.TLSStruct {
    epoch;
    sequence_number;
    type;
    version;
    fragment_length;
    static __spec = {
        epoch: TypeSpecs.uint16,
        sequence_number: TypeSpecs.uint48,
        type: ContentType_1.ContentType.__spec,
        version: TypeSpecs.define.Struct(ProtocolVersion_1.ProtocolVersion),
        fragment_length: TypeSpecs.uint16,
    };
    constructor(epoch, sequence_number, type, version, fragment_length) {
        super(MACHeader.__spec);
        this.epoch = epoch;
        this.sequence_number = sequence_number;
        this.type = type;
        this.version = version;
        this.fragment_length = fragment_length;
    }
    static createEmpty() {
        return new MACHeader(null, null, null, null, null);
    }
}
exports.MACHeader = MACHeader;
