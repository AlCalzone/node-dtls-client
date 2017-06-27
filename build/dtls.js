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
        // TODO: only bind "message" event after the handshake is finished
        if (callback != null)
            ret.on("message", callback);
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
            _this.isShakingHands = true;
            _this.bufferedMessages = [];
            // setup the connection
            _this.udp = dgram
                .createSocket(options, _this.udp_onMessage)
                .on("listening", _this.udp_onListening)
                .on("message", _this.udp_onMessage)
                .on("close", _this.udp_onClose)
                .on("error", _this.udp_onError);
            return _this;
        }
        /**
         * Send the given data. It is automatically compressed and encrypted.
         */
        Socket.prototype.send = function (data, callback) {
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
            // initialize record layer
            this.recordLayer = new RecordLayer_1.RecordLayer(this.udp, this.options);
            // also start handshake
            this.handshakeHandler = new HandshakeHandler_1.ClientHandshakeHandler(this.recordLayer);
            // TODO: when done, emit event
        };
        Socket.prototype.udp_onMessage = function (msg, rinfo) {
            // decode the messages
            var messages = this.recordLayer.receive(msg);
            // TODO: only for handshake messages, if they are received out of sequence,
            // buffer them up and serve them with the next batch of messages
            // also implement retransmission.
            for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                var msg_1 = messages_1[_i];
                switch (msg_1.type) {
                    case ContentType_1.ContentType.handshake:
                        var handshake = TLSStruct_1.TLSStruct.from(Handshake_1.FragmentedHandshake.spec, msg_1.data).result;
                        this.handshakeHandler.processMessage(handshake);
                        break;
                    case ContentType_1.ContentType.change_cipher_spec:
                        this.handshakeHandler.changeCipherSpec();
                        break;
                    case ContentType_1.ContentType.alert:
                        // TODO: read spec to see how we handle this
                        break;
                    case ContentType_1.ContentType.application_data:
                        if (this.isShakingHands) {
                            // if we are still shaking hands, buffer the message until we're done
                            this.bufferedMessages.push(msg_1);
                        }
                        else {
                            // else emit the message
                            // TODO: extend params?
                            this.emit("message", msg_1, rinfo);
                        }
                        break;
                }
            }
        };
        Socket.prototype.udp_onClose = function () {
            // TODO
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