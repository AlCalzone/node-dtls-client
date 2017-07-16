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
var events_1 = require("events");
var dgram = require("dgram");
var RecordLayer_1 = require("./DTLS/RecordLayer");
var ContentType_1 = require("./TLS/ContentType");
var HandshakeHandler_1 = require("./DTLS/HandshakeHandler");
var Handshake_1 = require("./DTLS/Handshake");
var TLSStruct_1 = require("./TLS/TLSStruct");
//import { DTLSPlaintext } from "./DTLS/DTLSPlaintext";
//import { DTLSCompressed } from "./DTLS/DTLSCompressed";
//import { DTLSCiphertext } from "./DTLS/DTLSCiphertext";
var dtls;
(function (dtls) {
    /**
     * Creates a DTLS-secured socket.
     * @param options - The options used to create the socket
     * @param callback - If provided, callback is bound to the "message" event
     */
    function createSocket(options, callback) {
        var ret = new Socket(options);
        // bind "message" event after the handshake is finished
        if (callback != null) {
            ret.on("connected", function () {
                ret.on("message", callback);
            });
        }
        return ret;
    }
    dtls.createSocket = createSocket;
    /**
     * DTLS-secured UDP socket. Can be used as a drop-in replacement for dgram.Socket
     */
    var Socket = (function (_super) {
        __extends(Socket, _super);
        /**
         * INTERNAL USE, DON'T CALL DIRECTLY. use createSocket instead!
         */
        function Socket(options) {
            var _this = _super.call(this) || this;
            _this.options = options;
            // buffer messages while handshaking
            _this.bufferedMessages = [];
            _this._isClosed = false;
            // setup the connection
            _this.udp = dgram
                .createSocket(options)
                .on("listening", _this.udp_onListening.bind(_this))
                .on("message", _this.udp_onMessage.bind(_this))
                .on("close", _this.udp_onClose.bind(_this))
                .on("error", _this.udp_onError.bind(_this));
            _this.udp.bind();
            return _this;
        }
        /**
         * Send the given data. It is automatically compressed and encrypted.
         */
        Socket.prototype.send = function (data, callback) {
            if (this._isClosed) {
                throw new Error("the socket is closed. cannot send data.");
            }
            // send finished data over UDP
            var packet = {
                type: ContentType_1.ContentType.application_data,
                data: data
            };
            this.recordLayer.send(packet, callback);
        };
        Socket.prototype.close = function (callback) {
            if (callback)
                this.on("close", callback);
            this.udp.close();
        };
        Socket.prototype.udp_onListening = function () {
            var _this = this;
            // initialize record layer
            this.recordLayer = new RecordLayer_1.RecordLayer(this.udp, this.options);
            // also start handshake
            this.handshakeHandler = new HandshakeHandler_1.ClientHandshakeHandler(this.recordLayer, this.options, function () {
                // when done, emit "connected" event
                _this.emit("connected");
                // also emit all buffered messages
                while (_this.bufferedMessages.length > 0) {
                    var _a = _this.bufferedMessages.shift(), msg = _a.msg, rinfo = _a.rinfo;
                    _this.emit("message", msg, rinfo);
                }
            });
        };
        Socket.prototype.udp_onMessage = function (udpMsg, rinfo) {
            // decode the messages
            var messages = this.recordLayer.receive(udpMsg);
            // TODO: implement retransmission.
            for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                var msg = messages_1[_i];
                switch (msg.type) {
                    case ContentType_1.ContentType.handshake:
                        var handshake = TLSStruct_1.TLSStruct.from(Handshake_1.FragmentedHandshake.spec, msg.data).result;
                        this.handshakeHandler.processIncomingMessage(handshake);
                        break;
                    case ContentType_1.ContentType.change_cipher_spec:
                        this.recordLayer.advanceReadEpoch();
                        break;
                    case ContentType_1.ContentType.alert:
                        // TODO: read spec to see how we handle this
                        break;
                    case ContentType_1.ContentType.application_data:
                        if (this.handshakeHandler.state !== HandshakeHandler_1.HandshakeStates.finished) {
                            // if we are still shaking hands, buffer the message until we're done
                            this.bufferedMessages.push({ msg: msg, rinfo: rinfo });
                        }
                        else {
                            // else emit the message
                            // TODO: extend params?
                            // TODO: do we need to emit rinfo?
                            this.emit("message", msg, rinfo);
                        }
                        break;
                }
            }
        };
        Socket.prototype.udp_onClose = function () {
            this._isClosed = true;
            this.emit("close");
        };
        Socket.prototype.udp_onError = function (exception) {
            this.emit("error", exception);
        };
        return Socket;
    }(events_1.EventEmitter));
    dtls.Socket = Socket;
})(dtls = exports.dtls || (exports.dtls = {}));
//# sourceMappingURL=dtls.js.map