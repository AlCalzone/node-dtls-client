"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Handshake = require("./Handshake");
var CipherSuites_1 = require("../DTLS/CipherSuites");
var ContentType_1 = require("../TLS/ContentType");
var ProtocolVersion_1 = require("../TLS/ProtocolVersion");
var SessionID_1 = require("../TLS/SessionID");
var Random_1 = require("../TLS/Random");
var Cookie_1 = require("../DTLS/Cookie");
var Vector_1 = require("../TLS/Vector");
var ConnectionState_1 = require("../TLS/ConnectionState");
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
        this.expectedResponses = [];
        // start by sending a ClientHello
        var hello = new Handshake.ClientHello();
        hello.message_seq = ++this.lastSentSeqNum;
        hello.client_version = new ProtocolVersion_1.ProtocolVersion(~1, ~2);
        hello.random = Random_1.Random.createNew();
        hello.session_id = SessionID_1.SessionID.create();
        hello.cookie = Cookie_1.Cookie.create();
        hello.cipher_suites = new Vector_1.Vector(Handshake.ClientHello.__spec.cipher_suites, [
            // TODO: allow more
            CipherSuites_1.CipherSuites.TLS_PSK_WITH_AES_128_CCM_8,
            CipherSuites_1.CipherSuites.TLS_PSK_WITH_AES_128_CBC_SHA
        ]);
        hello.compression_methods = new Vector_1.Vector(Handshake.ClientHello.__spec.compression_methods, [ConnectionState_1.CompressionMethod.null]);
        hello.extensions = new Vector_1.Vector(Handshake.ClientHello.__spec.extensions);
        this.sendFlight([hello], [
            Handshake.HandshakeType.server_hello,
            Handshake.HandshakeType.hello_verify_request
        ]);
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
            if (this.expectedResponses != null) {
                // if we expect a flight and this is the one, call the handler
                if (this.expectedResponses.indexOf(lastMsg.msg_type) > -1) {
                    this.expectedResponses = null;
                    // and remember the seq number
                    this.lastProcessedSeqNum = lastMsg.message_seq;
                    // call the handler and clear the buffer
                    var messages = completeMsgIndizes.map(function (i) { return _this.completeMessages[i]; });
                    this.completeMessages = {};
                    this.handle[lastMsg.msg_type](messages);
                    // TODO: clear a retransmission timer
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
    ClientHandshakeHandler.prototype.sendFlight = function (flight, expectedResponses) {
        var _this = this;
        // TODO: buffer the flight for retransmission
        this.expectedResponses = expectedResponses;
        flight.forEach(function (handshake) { return _this.sendHandshakeMessage(handshake); });
    };
    /**
     * Fragments a handshake message, serializes the fragements into single messages and sends them over the record layer
     * @param handshake - The handshake message to be sent
     */
    ClientHandshakeHandler.prototype.sendHandshakeMessage = function (handshake) {
        var messages = handshake
            .fragmentMessage()
            .map(function (fragment) { return ({
            type: ContentType_1.ContentType.handshake,
            data: fragment.serialize()
        }); });
        this.recordLayer.sendAll(messages);
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