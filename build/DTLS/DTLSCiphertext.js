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
var TypeSpecs = require("../TLS/TypeSpecs");
var TLSStruct_1 = require("../TLS/TLSStruct");
var ProtocolVersion_1 = require("../TLS/ProtocolVersion");
var ContentType_1 = require("../TLS/ContentType");
var DTLSCompressed_1 = require("./DTLSCompressed");
var DTLSCiphertext = (function (_super) {
    __extends(DTLSCiphertext, _super);
    function DTLSCiphertext(type, version, epoch, sequence_number, fragment // <XXX>Ciphertext
    ) {
        if (version === void 0) { version = new ProtocolVersion_1.ProtocolVersion(); }
        var _this = _super.call(this, DTLSCiphertext.__spec) || this;
        _this.type = type;
        _this.version = version;
        _this.epoch = epoch;
        _this.sequence_number = sequence_number;
        _this.fragment = fragment; // <XXX>Ciphertext
        return _this;
    }
    DTLSCiphertext.createEmpty = function () {
        return new DTLSCiphertext(null, null, null, null, null);
    };
    /**
     * Encrypts the given compressed packet
     * @param packet - The packet to be encrypted
     * @param cipher - The cipher used to encrypt the given packet
     * @param outgoingMac - The MAC function used for outgoing packets
     */
    DTLSCiphertext.encrypt = function (packet, cipher, outgoingMac) {
        // compute the MAC for this packet
        var MAC = outgoingMac(Buffer.concat([
            packet.computeMACHeader(),
            packet.fragment
        ]));
        // combine that with the MAC to form the plaintext and encrypt it
        var plaintext = Buffer.concat([
            packet.fragment,
            MAC
        ]);
        var ciphertext = cipher(plaintext);
        return new DTLSCiphertext(packet.type, packet.version, packet.epoch, packet.sequence_number, ciphertext);
    };
    /**
     * Decrypts this packet into a compressed packet
     * @param decipher - The decipher used to decrypt this packet
     * @param incomingMac - The MAC function used for incoming packets
     */
    DTLSCiphertext.prototype.decrypt = function (decipher, incomingMac) {
        var decipherResult = decipher(this.fragment);
        if (decipherResult.err) {
            // calculate fake MAC to prevent a timing attack
            incomingMac(decipherResult.result);
            // now throw the error
            throw decipherResult.err;
        }
        // split the plaintext into content and MAC
        var plaintext = decipherResult.result;
        var content = plaintext.slice(0, -incomingMac.length);
        var receivedMAC = plaintext.slice(-incomingMac.length);
        // Create the compressed packet
        var ret = new DTLSCompressed_1.DTLSCompressed(this.type, this.version, this.epoch, this.sequence_number, content);
        // compute the expected MAC for this packet
        var expectedMAC = incomingMac(Buffer.concat([
            ret.computeMACHeader(),
            ret.fragment
        ]));
        // and check if it matches the actual one
        if (!expectedMAC.equals(receivedMAC)) {
            throw new Error("invalid MAC detected in DTLS packet");
        }
        return ret;
    };
    return DTLSCiphertext;
}(TLSStruct_1.TLSStruct));
DTLSCiphertext.__spec = {
    type: ContentType_1.ContentType.__spec,
    version: TypeSpecs.define.Struct(ProtocolVersion_1.ProtocolVersion),
    epoch: TypeSpecs.uint16,
    sequence_number: TypeSpecs.uint48,
    // length field is implied in the variable length vector //length: new TypeSpecs.Calculated("uint16", "serializedLength", "fragment"),
    fragment: TypeSpecs.define.Buffer(0, 2048 + Math.pow(2, 14))
};
DTLSCiphertext.spec = TypeSpecs.define.Struct(DTLSCiphertext);
exports.DTLSCiphertext = DTLSCiphertext;
//# sourceMappingURL=DTLSCiphertext.js.map