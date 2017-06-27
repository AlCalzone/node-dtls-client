"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* DTLS Timeout and retransmission state machine for the handshake protocol
* according to https://tools.ietf.org/html/rfc6347#section-4.2.4
*/
var HandshakeStates;
(function (HandshakeStates) {
    HandshakeStates[HandshakeStates["preparing"] = 0] = "preparing";
    HandshakeStates[HandshakeStates["sending"] = 1] = "sending";
    HandshakeStates[HandshakeStates["waiting"] = 2] = "waiting";
    HandshakeStates[HandshakeStates["finished"] = 3] = "finished";
})(HandshakeStates = exports.HandshakeStates || (exports.HandshakeStates = {}));
var ClientHandshakeHandler = (function () {
    function ClientHandshakeHandler(recordLayer) {
        this.recordLayer = recordLayer;
        this._state = HandshakeStates.preparing;
    }
    Object.defineProperty(ClientHandshakeHandler.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * (Re)negotiates a DTLS session
     */
    ClientHandshakeHandler.prototype.renegotiate = function () {
    };
    /**
     * Processes a received handshake message
     */
    ClientHandshakeHandler.prototype.processMessage = function (msg) {
    };
    /**
     * reacts to a ChangeCipherSpec message
     */
    ClientHandshakeHandler.prototype.changeCipherSpec = function () {
    };
    return ClientHandshakeHandler;
}());
exports.ClientHandshakeHandler = ClientHandshakeHandler;
//# sourceMappingURL=HandshakeHandler.js.map