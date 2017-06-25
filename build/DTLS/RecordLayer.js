"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConnectionState_1 = require("../TLS/ConnectionState");
var ProtocolVersion_1 = require("../TLS/ProtocolVersion");
var DTLSPlaintext_1 = require("./DTLSPlaintext");
var DTLSCompressed_1 = require("./DTLSCompressed");
var DTLSCiphertext_1 = require("./DTLSCiphertext");
var RecordLayer = (function () {
    function RecordLayer(udpSocket, options) {
        this.udpSocket = udpSocket;
        this.options = options;
        /**
         * Connection states ordered by epochs
         */
        this.connectionStates = [];
        /**
         * The current epoch used for reading data
         */
        this._readEpoch = 0;
        // TODO: use anti replay window
        /**
         * The current epoch used for writing data
         */
        this._writeEpoch = 0;
        this._writeSequenceNumber = 0;
        // TODO: mal sehen, ob das nicht woanders besser aufgehoben ist
        /**
         * Maximum transfer unit of the underlying connection.
         * Note: Ethernet supports up to 1500 bytes, of which 20 bytes are reserved for the IP header and 8 for the UDP header
         */
        this.MTU = 1280;
        this.MTU_OVERHEAD = 20 + 8;
        // initialize with NULL cipherspec
        // current state
        this.connectionStates[0] = new ConnectionState_1.ConnectionState();
        // pending state
        this.ensurePendingState();
    }
    RecordLayer.prototype.send = function (msg, callback) {
        var currentWriteState = this.connectionStates[this.writeEpoch];
        var packet = new DTLSPlaintext_1.DTLSPlaintext(msg.type, new ProtocolVersion_1.ProtocolVersion(~1, ~2), // 2's complement of 1.2
        this._writeEpoch, ++this._writeSequenceNumber, // sequence number increased by 1
        msg.data);
        // compress packet
        var compressor = function (identity) { return identity; }; // TODO: implement compression algorithms
        packet = DTLSCompressed_1.DTLSCompressed.compress(packet, compressor);
        // encrypt packet
        packet = DTLSCiphertext_1.DTLSCiphertext.encrypt(packet, currentWriteState.Cipher, currentWriteState.OutgoingMac);
        // get send buffer
        var buf = packet.serialize();
        // and send it
        this.udpSocket.send(buf, this.options.port, this.options.address, callback);
    };
    Object.defineProperty(RecordLayer.prototype, "readEpoch", {
        get: function () { return this._readEpoch; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecordLayer.prototype, "writeEpoch", {
        get: function () { return this._writeEpoch; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecordLayer.prototype, "writeSequenceNumber", {
        get: function () { return this._writeSequenceNumber; },
        enumerable: true,
        configurable: true
    });
    ;
    RecordLayer.prototype.advanceReadEpoch = function () {
        this._readEpoch++;
        this.ensurePendingState();
    };
    RecordLayer.prototype.advanceWriteEpoch = function () {
        this._writeEpoch++;
        this._writeSequenceNumber = 0;
        this.ensurePendingState();
    };
    RecordLayer.prototype.ensurePendingState = function () {
        // makes sure a pending state exists
        if (!this.connectionStates[this.nextEpoch])
            this.connectionStates[this.nextEpoch] = new ConnectionState_1.ConnectionState();
    };
    Object.defineProperty(RecordLayer.prototype, "nextEpoch", {
        get: function () {
            return Math.max(this.readEpoch, this.writeEpoch) + 1;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(RecordLayer.prototype, "MAX_PAYLOAD_SIZE", {
        get: function () { return this.MTU - this.MTU_OVERHEAD; },
        enumerable: true,
        configurable: true
    });
    return RecordLayer;
}());
RecordLayer.IMPLEMENTED_PROTOCOL_VERSION = ;
exports.RecordLayer = RecordLayer;
//# sourceMappingURL=RecordLayer.js.map