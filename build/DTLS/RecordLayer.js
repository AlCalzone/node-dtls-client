"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AntiReplayWindow_1 = require("../TLS/AntiReplayWindow");
var ConnectionState_1 = require("../TLS/ConnectionState");
var ContentType_1 = require("../TLS/ContentType");
var ProtocolVersion_1 = require("../TLS/ProtocolVersion");
var DTLSCiphertext_1 = require("./DTLSCiphertext");
var DTLSCompressed_1 = require("./DTLSCompressed");
var DTLSPlaintext_1 = require("./DTLSPlaintext");
// enable debug output
var debugPackage = require("debug");
var debug = debugPackage("node-dtls-client");
var RecordLayer = /** @class */ (function () {
    // TODO: specify connection end
    function RecordLayer(udpSocket, options) {
        this.udpSocket = udpSocket;
        this.options = options;
        /**
         * All known connection epochs
         */
        this.epochs = [];
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
        var buf = this.processOutgoingMessage(msg);
        this.udpSocket.send(buf, 0, buf.length, this.options.port, this.options.address, callback);
    };
    /**
     * Transforms the given message into a DTLSCiphertext packet,
     * does neccessary processing and buffers it up for sending
     */
    RecordLayer.prototype.processOutgoingMessage = function (msg) {
        var epoch = this.epochs[this.writeEpochNr];
        var packet = new DTLSPlaintext_1.DTLSPlaintext(msg.type, epoch.connectionState.protocolVersion || RecordLayer.DTLSVersion, this._writeEpochNr, ++epoch.writeSequenceNumber, // sequence number increased by 1
        msg.data);
        // compress packet
        var compressor = function (identity) { return identity; }; // TODO: only valid for NULL compression, check it!
        packet = DTLSCompressed_1.DTLSCompressed.compress(packet, compressor);
        if (epoch.connectionState.cipherSuite.cipherType != null) {
            // encrypt packet
            packet = epoch.connectionState.Cipher(packet);
        }
        // get send buffer
        var ret = packet.serialize();
        // advance the write epoch, so we use the new params for sending the next messages
        if (msg.type === ContentType_1.ContentType.change_cipher_spec) {
            this.advanceWriteEpoch();
        }
        return ret;
    };
    /**
     * Sends all messages of a flight in one packet
     * @param messages - The messages to be sent
     */
    RecordLayer.prototype.sendFlight = function (messages, callback) {
        var _this = this;
        var buf = Buffer.concat(messages.map(function (msg) { return _this.processOutgoingMessage(msg); }));
        this.udpSocket.send(buf, 0, buf.length, this.options.port, this.options.address, callback);
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
                if (packet.readBytes <= 0) {
                    // this shouldn't happen, but we don't want to introduce an infinite loop
                    throw new Error("Zero or less bytes read while parsing DTLS packet.");
                }
                packets.push(packet.result);
                offset += packet.readBytes;
            }
            catch (e) {
                // TODO: cancel connection or what?
                debug("Error in RecordLayer.receive: " + e);
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
        var decompressor = function (identity) { return identity; }; // TODO: only valid for NULL compression, check it!
        packets = packets
            .map(function (p) {
            var connectionState = _this.epochs[p.epoch].connectionState;
            try {
                return connectionState.Decipher(p);
            }
            catch (e) {
                // decryption can fail because of bad MAC etc...
                // TODO: terminate connection if some threshold is passed (bad_record_mac)
                return null;
            }
        })
            .filter(function (p) { return p != null; }) // filter out packets that couldn't be decrypted
            .map(function (p) { return p.decompress(decompressor); });
        // update the anti replay window
        for (var _i = 0, packets_1 = packets; _i < packets_1.length; _i++) {
            var p = packets_1[_i];
            this.epochs[p.epoch].antiReplayWindow.markAsReceived(p.sequence_number);
        }
        return packets.map(function (p) { return ({
            type: p.type,
            data: p.fragment,
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
    /**
     * Maximum transfer unit of the underlying connection.
     * Note: Ethernet supports up to 1500 bytes, of which 20 bytes are reserved for the IP header and 8 for the UDP header
     */
    RecordLayer.MTU = 1280;
    RecordLayer.MTU_OVERHEAD = 20 + 8;
    // Default to DTLSv1.2
    RecordLayer.DTLSVersion = new ProtocolVersion_1.ProtocolVersion(~1, ~2);
    return RecordLayer;
}());
exports.RecordLayer = RecordLayer;
