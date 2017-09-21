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
var dgram = require("dgram");
var events_1 = require("events");
var Handshake_1 = require("./DTLS/Handshake");
var HandshakeHandler_1 = require("./DTLS/HandshakeHandler");
var RecordLayer_1 = require("./DTLS/RecordLayer");
var Alert_1 = require("./TLS/Alert");
var ContentType_1 = require("./TLS/ContentType");
var TLSStruct_1 = require("./TLS/TLSStruct");
// enable debug output
var debugPackage = require("debug");
var debug = debugPackage("node-dtls-client");
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
            ret.once("connected", function () {
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
            _this._handshakeFinished = false;
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
            // setup a timeout watcher. Default: 1000ms timeout, minimum: 100ms
            _this.options.timeout = Math.max(100, _this.options.timeout || 1000);
            _this._udpConnected = false;
            _this._connectionTimeout = setTimeout(function () { return _this.expectConnection(); }, _this.options.timeout);
            // start the connection
            _this.udp.bind();
            return _this;
        }
        /**
         * Send the given data. It is automatically compressed and encrypted.
         */
        Socket.prototype.send = function (data, callback) {
            if (this._isClosed) {
                throw new Error("The socket is closed. Cannot send data.");
            }
            if (!this._handshakeFinished) {
                throw new Error("DTLS handshake is not finished yet. Cannot send data.");
            }
            // send finished data over UDP
            var packet = {
                type: ContentType_1.ContentType.application_data,
                data: data,
            };
            this.recordLayer.send(packet, callback);
        };
        /**
         * Closes the connection
         */
        Socket.prototype.close = function (callback) {
            var _this = this;
            this.sendAlert(new Alert_1.Alert(Alert_1.AlertLevel.warning, Alert_1.AlertDescription.close_notify), function (e) {
                _this.udp.close();
                if (callback)
                    _this.once("close", callback);
            });
        };
        Socket.prototype.udp_onListening = function () {
            var _this = this;
            // connection successful
            this._udpConnected = true;
            if (this._connectionTimeout != null)
                clearTimeout(this._connectionTimeout);
            // initialize record layer
            this.recordLayer = new RecordLayer_1.RecordLayer(this.udp, this.options);
            // reuse the connection timeout for handshake timeout watching
            this._connectionTimeout = setTimeout(function () { return _this.expectHandshake(); }, this.options.timeout);
            // also start handshake
            this.handshakeHandler = new HandshakeHandler_1.ClientHandshakeHandler(this.recordLayer, this.options, function (alert, err) {
                var nextStep = function () {
                    // if we have an error, terminate the connection
                    if (err) {
                        // something happened on the way to heaven
                        _this.killConnection(err);
                    }
                    else {
                        // when done, emit "connected" event
                        _this._handshakeFinished = true;
                        if (_this._connectionTimeout != null)
                            clearTimeout(_this._connectionTimeout);
                        _this.emit("connected");
                        // also emit all buffered messages
                        while (_this.bufferedMessages.length > 0) {
                            var _a = _this.bufferedMessages.shift(), msg = _a.msg, rinfo = _a.rinfo;
                            _this.emit("message", msg.data, rinfo);
                        }
                    }
                };
                // if we have an alert, send it to the other party
                if (alert) {
                    _this.sendAlert(alert, nextStep);
                }
                else {
                    nextStep();
                }
            });
        };
        // is called after the connection timeout expired.
        // Check the connection and throws if it is not established yet
        Socket.prototype.expectConnection = function () {
            if (!this._udpConnected) {
                // connection timed out
                this.killConnection(new Error("The connection timed out"));
            }
        };
        Socket.prototype.expectHandshake = function () {
            if (!this._handshakeFinished) {
                // handshake timed out
                this.killConnection(new Error("The DTLS handshake timed out"));
            }
        };
        Socket.prototype.sendAlert = function (alert, callback) {
            // send alert to the other party
            var packet = {
                type: ContentType_1.ContentType.alert,
                data: alert.serialize(),
            };
            this.recordLayer.send(packet, callback);
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
                        var alert_1 = TLSStruct_1.TLSStruct.from(Alert_1.Alert.spec, msg.data).result;
                        if (alert_1.level === Alert_1.AlertLevel.fatal) {
                            // terminate the connection when receiving a fatal alert
                            var errorMessage = "received fatal alert: " + Alert_1.AlertDescription[alert_1.description];
                            debug(errorMessage);
                            this.killConnection(new Error(errorMessage));
                        }
                        else if (alert_1.level === Alert_1.AlertLevel.warning) {
                            // not sure what to do with most warning alerts
                            switch (alert_1.description) {
                                case Alert_1.AlertDescription.close_notify:
                                    // except close_notify, which means we should terminate the connection
                                    this.close();
                                    break;
                            }
                        }
                        break;
                    case ContentType_1.ContentType.application_data:
                        if (!this._handshakeFinished) {
                            // if we are still shaking hands, buffer the message until we're done
                            this.bufferedMessages.push({ msg: msg, rinfo: rinfo });
                        }
                        else {
                            // else emit the message
                            // TODO: extend params?
                            // TODO: do we need to emit rinfo?
                            this.emit("message", msg.data, rinfo);
                        }
                        break;
                }
            }
        };
        Socket.prototype.udp_onClose = function () {
            this._isClosed = true;
            // we no longer want to receive events
            this.udp.removeAllListeners();
            this.emit("close");
        };
        Socket.prototype.udp_onError = function (exception) {
            this.emit("error", exception);
        };
        /** Kills the underlying UDP connection and emits an error if neccessary */
        Socket.prototype.killConnection = function (err) {
            this._isClosed = true;
            this.udp.removeAllListeners();
            this.udp.close();
            if (err != null)
                this.emit("error", err);
        };
        return Socket;
    }(events_1.EventEmitter));
    dtls.Socket = Socket;
})(dtls = exports.dtls || (exports.dtls = {}));
//# sourceMappingURL=dtls.js.map