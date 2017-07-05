"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConnectionState_1 = require("../TLS/ConnectionState");
var ProtocolVersion_1 = require("../TLS/ProtocolVersion");
var DTLSPlaintext_1 = require("./DTLSPlaintext");
var DTLSCompressed_1 = require("./DTLSCompressed");
var DTLSCiphertext_1 = require("./DTLSCiphertext");
var AntiReplayWindow_1 = require("../TLS/AntiReplayWindow");
var RecordLayer = (function () {
    // TODO: specify connection end
    function RecordLayer(udpSocket, options) {
        this.udpSocket = udpSocket;
        this.options = options;
        /**
         * All known connection epochs
         */
        this.epochs = [];
        //private connectionStates: ConnectionState[/* epoch */] = [];
        this._readEpochNr = 0;
        this._writeEpochNr = 0;
        // initialize with NULL cipherspec
        // current state
        this.epochs[0] = this.createEpoch(0);
        // pending state
        this.epochs[1] = this.createEpoch(1);
    }
    /**
     * Transforms the given message into a DTLSCiphertext packet and sends it via UDP
     * @param msg - The message to be sent
     * @param callback - The function to be called after sending the message.
     */
    RecordLayer.prototype.send = function (msg, callback) {
        var epoch = this.epochs[this.writeEpochNr];
        var packet = new DTLSPlaintext_1.DTLSPlaintext(msg.type, new ProtocolVersion_1.ProtocolVersion(~1, ~2), // 2's complement of 1.2
        this._writeEpochNr, ++epoch.writeSequenceNumber, // sequence number increased by 1
        msg.data);
        // compress packet
        var compressor = function (identity) { return identity; }; // TODO: implement compression algorithms
        packet = DTLSCompressed_1.DTLSCompressed.compress(packet, compressor);
        if (epoch.connectionState.cipherSuite.cipherType != null) {
            // encrypt packet
            packet = DTLSCiphertext_1.DTLSCiphertext.encrypt(packet, epoch.connectionState.Cipher, epoch.connectionState.OutgoingMac);
        }
        // get send buffer
        var buf = packet.serialize();
        // TODO: check if the buffer satisfies the configured MTU
        // and send it
        this.udpSocket.send(buf, this.options.port, this.options.address, callback);
    };
    /**
     * Sends all given messages
     * @param messages - The messages to be sent
     */
    RecordLayer.prototype.sendAll = function (messages) {
        var _this = this;
        // TODO: enable send callbacks for bulk sending
        messages.forEach(function (msg) { return _this.send(msg); });
    };
    /**
     * Receives DTLS messages from the given buffer.
     * @param buf The buffer containing DTLSCiphertext packets
     */
    RecordLayer.prototype.receive = function (buf) {
        var _this = this;
        var offset = 0;
        var packets = [];
        while (offset < buf.length) {
            try {
                var packet = DTLSCiphertext_1.DTLSCiphertext.from(DTLSCiphertext_1.DTLSCiphertext.spec, buf, offset);
                packets.push(packet.result);
                offset += packet.readBytes;
            }
            catch (e) {
                // TODO: cancel connection or what?
                break;
            }
        }
        // now filter packets
        var knownEpochs = Object.keys(this.epochs).map(function (k) { return +k; });
        packets = packets
            .filter(function (p) {
            if (!(p.epoch in knownEpochs)) {
                // discard packets from an unknown epoch
                // this will keep packets from the upcoming one
                return false;
            }
            else if (p.epoch < _this.readEpochNr) {
                // discard old packets
                return false;
            }
            // discard packets that are not supposed to be received
            if (!_this.epochs[p.epoch].antiReplayWindow.mayReceive(p.sequence_number)) {
                return false;
            }
            // parse the packet
            return true;
        });
        // decompress and decrypt packets
        var decompressor = function (identity) { return identity; }; // TODO implement actual compression methods
        packets = packets
            .map(function (p) {
            var connectionState = _this.epochs[p.epoch].connectionState;
            try {
                return p.decrypt(connectionState.Decipher, connectionState.IncomingMac);
            }
            catch (e) {
                // decryption can fail because of bad MAC etc...
                // TODO: terminate connection if some threshold is passed (bad_record_mac)
                return null;
            }
        })
            .filter(function (p) { return p != null; }) // filter out packets that couldn't be decrypted
            .map(function (p) { return p.decompress(decompressor); });
        return packets.map(function (p) { return ({
            type: p.type,
            data: p.fragment
        }); });
    };
    Object.defineProperty(RecordLayer.prototype, "readEpochNr", {
        get: function () { return this._readEpochNr; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecordLayer.prototype, "currentReadEpoch", {
        /**
         * The current epoch used for reading data
         */
        get: function () { return this.epochs[this._readEpochNr]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecordLayer.prototype, "nextReadEpoch", {
        get: function () { return this.epochs[this._readEpochNr + 1]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecordLayer.prototype, "writeEpochNr", {
        get: function () { return this._writeEpochNr; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecordLayer.prototype, "currentWriteEpoch", {
        /**
         * The current epoch used for writing data
         */
        get: function () { return this.epochs[this._writeEpochNr]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecordLayer.prototype, "nextWriteEpoch", {
        get: function () { return this.epochs[this._writeEpochNr + 1]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecordLayer.prototype, "nextEpochNr", {
        get: function () {
            return Math.max(this.readEpochNr, this.writeEpochNr) + 1;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(RecordLayer.prototype, "nextEpoch", {
        /**
         * The next read and write epoch that will be used.
         * Be careful as this might point to the wrong epoch between ChangeCipherSpec messages
         */
        get: function () { return this.epochs[this.nextEpochNr]; },
        enumerable: true,
        configurable: true
    });
    /**
     * Ensure there's a next epoch to switch to
     */
    RecordLayer.prototype.ensureNextEpoch = function () {
        // makes sure a pending state exists
        if (!this.epochs[this.nextEpochNr]) {
            this.epochs[this.nextEpochNr] = this.createEpoch(this.nextEpochNr);
        }
    };
    RecordLayer.prototype.createEpoch = function (index) {
        return {
            index: index,
            connectionState: new ConnectionState_1.ConnectionState(),
            antiReplayWindow: new AntiReplayWindow_1.AntiReplayWindow(),
            writeSequenceNumber: -1,
        };
    };
    RecordLayer.prototype.advanceReadEpoch = function () {
        this._readEpochNr++;
        this.ensureNextEpoch();
    };
    RecordLayer.prototype.advanceWriteEpoch = function () {
        this._writeEpochNr++;
        this.ensureNextEpoch();
    };
    Object.defineProperty(RecordLayer, "MAX_PAYLOAD_SIZE", {
        get: function () { return RecordLayer.MTU - RecordLayer.MTU_OVERHEAD; },
        enumerable: true,
        configurable: true
    });
    ;
    return RecordLayer;
}());
// TODO: mal sehen, ob das nicht woanders besser aufgehoben ist
/**
 * Maximum transfer unit of the underlying connection.
 * Note: Ethernet supports up to 1500 bytes, of which 20 bytes are reserved for the IP header and 8 for the UDP header
 */
RecordLayer.MTU = 1280;
RecordLayer.MTU_OVERHEAD = 20 + 8;
exports.RecordLayer = RecordLayer;
//# sourceMappingURL=RecordLayer.js.map