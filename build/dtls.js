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
var dtls;
(function (dtls) {
    /**
     * Creates a DTLS-secured socket.
     * @param options - The options used to create the socket
     * @param callback - If provided, callback is bound to the "message" event
     */
    function createSocket(options, callback) {
        var ret = new Socket(options);
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
            _this.udp = dgram
                .createSocket(options, _this.udp_onMessage)
                .on("listening", _this.udp_onListening)
                .on("message", _this.udp_onMessage)
                .on("close", _this.udp_onClose)
                .on("error", _this.udp_onError);
            return _this;
        }
        Socket.prototype.send = function (msg, port, address, callback) {
            //send(msg: Buffer, offset: number, length: number, port: number, address?: string, callback?: SendCallback) {
            // TODO: for now only allow the short syntax. Enable alternative definitions later
            // TODO: modify data
            // send finished data over UDP
            this.udp.send(msg, port, address, callback);
        };
        Socket.prototype.close = function (callback) {
            if (callback)
                this.on("close", callback);
            this.udp.close();
        };
        Socket.prototype.udp_onListening = function () {
            // TODO handle data
            this.emit("listening");
        };
        Socket.prototype.udp_onMessage = function (msg, rinfo) {
            // TODO handle data
            // TODO: extend params?
            this.emit("message", msg, rinfo);
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