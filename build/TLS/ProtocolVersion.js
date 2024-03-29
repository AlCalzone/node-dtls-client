"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolVersion = void 0;
const TLSStruct_1 = require("./TLSStruct");
const TypeSpecs = require("./TypeSpecs");
// TLS -> Anpassen für DTLS!!!
class ProtocolVersion extends TLSStruct_1.TLSStruct {
    /**
     *
     * @param major - Hauptversionsnummer
     * @param minor - Nebenversionsnummer
     */
    constructor(major = 0, minor = 0) {
        super(ProtocolVersion.__spec);
        this.major = major;
        this.minor = minor;
    }
    static createEmpty() {
        return new ProtocolVersion();
    }
}
exports.ProtocolVersion = ProtocolVersion;
ProtocolVersion.__spec = {
    major: TypeSpecs.uint8,
    minor: TypeSpecs.uint8,
};
