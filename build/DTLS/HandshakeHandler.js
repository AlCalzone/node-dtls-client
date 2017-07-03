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
        /**
         * handles server messages
         */
        this.handle = (_a = {},
            /** Handles a HelloVerifyRequest message */
            _a[Handshake.HandshakeType.hello_verify_request] = function (messages) {
            },
            _a);
        this.renegotiate();
        var _a;
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
        this.expectedFlight = [];
    };
    /**
     * Processes a received handshake message
     */
    ClientHandshakeHandler.prototype.processMessage = function (msg) {
        var _this = this;
        var checkFlight;
        if (msg.isFragmented()) {
            // remember incomplete messages and try to assemble them afterwards
            this.incompleteMessages.push(msg);
            checkFlight = this.tryAssembleFragments(msg);
        }
        else {
            // the message is already complete, we only need to parse it
            this.completeMessages[msg.message_seq] = Handshake.Handshake.parse(msg);
            checkFlight = true;
        }
        // check if the flight is the current one, and complete
        if (checkFlight) {
            var completeMsgIndizes = Object.keys(this.completeMessages).map(function (k) { return +k; });
            // a flight is complete if it forms a non-interrupted sequence of seq-nums
            var isComplete = [this.lastProcessedSeqNum].concat(completeMsgIndizes).every(function (val, i, arr) { return (i === 0) || (val === arr[i - 1] + 1); });
            if (!isComplete)
                return;
            var lastMsg = this.completeMessages[Math.max.apply(Math, completeMsgIndizes)];
            if (this.expectedFlight != null) {
                // if we expect a flight and this is the one, call the handler
                if (this.expectedFlight.indexOf(lastMsg.msg_type) > -1) {
                    this.expectedFlight = null;
                    // and remember the seq number
                    this.lastProcessedSeqNum = lastMsg.message_seq;
                    // call the handler and clear the buffer
                    var messages = completeMsgIndizes.map(function (i) { return _this.completeMessages[i]; });
                    this.completeMessages = {};
                    this.handle[lastMsg.msg_type](messages);
                }
            }
            else {
                // if we don't expect a flight, maybe do something depending on the type of the message
                // TODO: react to server sending us rehandshake invites
            }
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