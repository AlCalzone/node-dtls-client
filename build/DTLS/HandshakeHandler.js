"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Handshake = require("./Handshake");
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
    function ClientHandshakeHandler(recordLayer, finishedCallback) {
        this.recordLayer = recordLayer;
        this.finishedCallback = finishedCallback;
        this.renegotiate();
    }
    Object.defineProperty(ClientHandshakeHandler.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * (Re)negotiates a DTLS session. Is automatically called when the Handshake handler is created
     */
    ClientHandshakeHandler.prototype.renegotiate = function () {
        // reset variables
        this._state = HandshakeStates.preparing;
        this.lastProcessedSeqNum = -1;
        this.lastSentSeqNum = -1;
        this.incompleteMessages = [];
        this.completeMessages = {};
        this.listeners = [];
    };
    /**
     * Processes a received handshake message
     */
    ClientHandshakeHandler.prototype.processMessage = function (msg) {
        var callListeners;
        if (msg.isFragmented()) {
            // remember incomplete messages and try to assemble them afterwards
            this.incompleteMessages.push(msg);
            callListeners = this.tryAssembleFragments(msg);
        }
        else {
            // the message is already complete, we only need to parse it
            this.completeMessages[msg.message_seq] = Handshake.Handshake.parse(msg);
            callListeners = true;
        }
        // call all listeners
        if (callListeners) {
            this.listeners.forEach(function (fn) { return fn(); });
        }
    };
    /**
     * Tries to assemble the fragmented messages in incompleteMessages
     */
    ClientHandshakeHandler.prototype.tryAssembleFragments = function (reference) {
        // find all matching fragments
        var allFragments = Handshake.FragmentedHandshake.findAllFragments(this.incompleteMessages, reference);
        if (Handshake.FragmentedHandshake.isComplete(allFragments)) {
            // if we found all, reassemble them
            var reassembled = Handshake.FragmentedHandshake.reassemble(allFragments);
            // add the message to the list of complete ones
            this.completeMessages[reassembled.message_seq] = Handshake.Handshake.parse(reassembled);
            // and remove the other ones from the list of incomplete ones
            this.incompleteMessages = this.incompleteMessages.filter(function (fragment) { return allFragments.indexOf(fragment) === -1; });
            return true;
        }
        return false;
    };
    /**
     * reacts to a ChangeCipherSpec message
     */
    ClientHandshakeHandler.prototype.changeCipherSpec = function () {
    };
    /**
     * waits until a specific combination of messages arrives
     * @param finalMessage - the type of the final message to be expected
     * @param callback - the function to be called when the messages arrive
     */
    ClientHandshakeHandler.prototype.waitForFlight = function (finalMessage, callback) {
        // TODO: add listener
        // TODO: remove listener when successful or timeout
    };
    return ClientHandshakeHandler;
}());
exports.ClientHandshakeHandler = ClientHandshakeHandler;
/* Client                                          Server
   ------                                          ------

   ClientHello             -------->                           Flight 1

                           <-------    HelloVerifyRequest      Flight 2

   ClientHello             -------->                           Flight 3

                                              ServerHello    \
                                             Certificate*     \
                                       ServerKeyExchange*      Flight 4
                                      CertificateRequest*     /
                           <--------      ServerHelloDone    /

   Certificate*                                              \
   ClientKeyExchange                                          \
   CertificateVerify*                                          Flight 5
   [ChangeCipherSpec]                                         /
   Finished                -------->                         /

                                       [ChangeCipherSpec]    \ Flight 6
                           <--------             Finished    /

               Figure 1. Message Flights for Full Handshake

=======================================================================

   Client                                           Server
   ------                                           ------

   ClientHello             -------->                          Flight 1

                                              ServerHello    \
                                       [ChangeCipherSpec]     Flight 2
                            <--------             Finished    /

   [ChangeCipherSpec]                                         \Flight 3
   Finished                 -------->                         /

         Figure 2. Message Flights for Session-Resuming Handshake
                           (No Cookie Exchange)
*/ 
//# sourceMappingURL=HandshakeHandler.js.map