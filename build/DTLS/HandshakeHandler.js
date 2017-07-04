"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Handshake = require("./Handshake");
var CipherSuites_1 = require("../DTLS/CipherSuites");
var ChangeCipherSpec_1 = require("../TLS/ChangeCipherSpec");
var ContentType_1 = require("../TLS/ContentType");
var ProtocolVersion_1 = require("../TLS/ProtocolVersion");
var SessionID_1 = require("../TLS/SessionID");
var Random_1 = require("../TLS/Random");
var Cookie_1 = require("../DTLS/Cookie");
var Vector_1 = require("../TLS/Vector");
var ConnectionState_1 = require("../TLS/ConnectionState");
var BitConverter_1 = require("../lib/BitConverter");
var PRF_1 = require("../TLS/PRF");
var PreMasterSecret_1 = require("../TLS/PreMasterSecret");
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
    function ClientHandshakeHandler(recordLayer, options, finishedCallback) {
        var _this = this;
        this.recordLayer = recordLayer;
        this.options = options;
        this.finishedCallback = finishedCallback;
        /**
         * handles server messages
         */
        this.handle = (_a = {},
            /** Handles a HelloVerifyRequest message */
            _a[Handshake.HandshakeType.hello_verify_request] = function (messages) {
                // this flight should only contain a single message, 
                // but to be sure extract the last one
                var hvr = messages[messages.length - 1];
                // add the cookie to the client hello and send it again
                var hello = _this.lastFlight[0];
                hello.cookie = hvr.cookie;
                // TODO: do something with session id?
                _this.sendFlight([hello], [Handshake.HandshakeType.server_hello_done]);
            },
            /** Handles a ServerHelloDone flight */
            _a[Handshake.HandshakeType.server_hello_done] = function (messages) {
                for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                    var msg = messages_1[_i];
                    switch (msg.msg_type) {
                        case Handshake.HandshakeType.server_hello:
                            var hello = msg;
                            // remember the random value
                            _this.recordLayer.nextEpoch.connectionState.server_random = hello.random.serialize();
                            // set the cipher suite and compression method to be used
                            _this.recordLayer.nextEpoch.connectionState.cipherSuite = CipherSuites_1.CipherSuites[hello.cipher_suite];
                            _this.recordLayer.nextEpoch.connectionState.compression_algorithm = hello.compression_method;
                            // TODO: parse/support extensions?
                            // TODO: remember the session id?
                            break;
                        // TODO: support more messages (certificates etc.)
                        case Handshake.HandshakeType.server_key_exchange:
                            var keyExchange = msg;
                            // parse the content depending on the key exchange algorithm
                            switch (_this.recordLayer.nextEpoch.connectionState.cipherSuite.keyExchange) {
                                case "psk":
                                    var keyExchange_PSK = Handshake.ServerKeyExchange_PSK.from(Handshake.ServerKeyExchange_PSK.spec, keyExchange.raw_data).result;
                                    // TODO: do something with the identity hint
                                    break;
                            }
                            break;
                        case Handshake.HandshakeType.server_hello_done:
                            // its our turn, build flight depending on the key exchange algorithm
                            var connState = _this.recordLayer.nextEpoch.connectionState;
                            // TODO: support multiple identities
                            var psk_identity = Object.keys(_this.options.psk)[0];
                            var preMasterSecret = void 0;
                            var flight = [];
                            switch (connState.cipherSuite.keyExchange) {
                                case "psk":
                                    // for PSK, build the key exchange message
                                    var keyExchange_1 = Handshake.ClientKeyExchange.createEmpty();
                                    var keyExchange_PSK = new Handshake.ClientKeyExchange_PSK(Vector_1.Vector.createFromBuffer(Buffer.from(psk_identity, "ascii")));
                                    keyExchange_1.raw_data = keyExchange_PSK.serialize();
                                    // and add it to the flight
                                    flight.push(keyExchange_1);
                                    // now we have everything, construct the pre master secret
                                    var psk = Vector_1.Vector.createFromBuffer(Buffer.from(_this.options.psk[psk_identity], "ascii"));
                                    preMasterSecret = new PreMasterSecret_1.PreMasterSecret(null, psk);
                                    break;
                            }
                            // we now have everything to compute the master secret
                            connState.computeMasterSecret(preMasterSecret);
                            // now we can send the finished message
                            // therefore concat the previous messages in this flight with all other data so far
                            // to calculate verify_data
                            var handshake_messages = Buffer.concat([_this.allHandshakeData].concat(flight.map(function (f) { return f.serialize(); })));
                            // now build the finished message and add it to the flight
                            var finished = new Handshake.Finished(_this.computeVerifyData(handshake_messages, "client"));
                            flight.push(finished);
                            // send the complete flight
                            _this.sendFlight(flight, [Handshake.HandshakeType.finished]);
                            break;
                    }
                }
            },
            /** Handles a Finished flight */
            _a[Handshake.HandshakeType.finished] = function (messages) {
                // this flight should only contain a single message, 
                // but to be sure extract the last one
                var finished = messages[messages.length - 1];
                // compute the expected verify data
                var expectedVerifyData = _this.computeVerifyData(_this.allHandshakeData, "server");
                if (BitConverter_1.buffersEqual(finished.verify_data, expectedVerifyData)) {
                    // all good!
                    _this.finishedCallback();
                }
                else {
                    // TODO: raise error, cancel connection
                }
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
        this.allHandshakeData = null;
        //this.cscReceived = false;
        //this.serverFinishedPending = false;
        // ==============================
        // start by sending a ClientHello
        var hello = Handshake.ClientHello.createEmpty();
        hello.client_version = new ProtocolVersion_1.ProtocolVersion(~1, ~2);
        hello.random = Random_1.Random.createNew();
        // remember this for crypto stuff
        this.recordLayer.nextEpoch.connectionState.client_random = hello.random.serialize();
        hello.session_id = SessionID_1.SessionID.createNew();
        hello.cookie = Cookie_1.Cookie.createNew();
        hello.cipher_suites = new Vector_1.Vector([
            // TODO: allow more
            CipherSuites_1.CipherSuites.TLS_PSK_WITH_AES_128_CCM_8,
            CipherSuites_1.CipherSuites.TLS_PSK_WITH_AES_128_CBC_SHA
        ].map(function (cs) { return cs.id; }));
        hello.compression_methods = new Vector_1.Vector([ConnectionState_1.CompressionMethod.null]);
        hello.extensions = new Vector_1.Vector();
        this.sendFlight([hello], [
            Handshake.HandshakeType.server_hello_done,
            Handshake.HandshakeType.hello_verify_request
        ]);
    };
    // special cases for reordering of "Finished" flights
    // TODO: add these special cases to general handling functions
    //private cscReceived: boolean;
    //private serverFinishedPending: boolean;
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
                    this.bufferHandshakeData.apply(this, messages);
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
        // advance the read epoch, so we understand the next messages received
        this.recordLayer.advanceReadEpoch();
        // TODO: how do we handle retransmission here?
        // TODO: how do we handle reordering (i.e. Finished received before ChangeCipherSpec)?
    };
    /**
     * Sends the given flight of messages and remembers it for potential retransmission
     * @param flight The flight to be sent.
     * @param expectedResponses The types of possible responses we are expecting.
     * @param retransmit If the flight is retransmitted, i.e. no sequence numbers are increased
     */
    ClientHandshakeHandler.prototype.sendFlight = function (flight, expectedResponses, retransmit) {
        var _this = this;
        if (retransmit === void 0) { retransmit = false; }
        this.lastFlight = flight;
        this.expectedResponses = expectedResponses;
        flight.forEach(function (handshake) {
            if (handshake.msg_type === Handshake.HandshakeType.finished) {
                // before finished messages, ALWAYS send a ChangeCipherSpec
                _this.sendChangeCipherSpecMessage();
                // TODO: how do we handle retransmission here?
            }
            if (!retransmit) {
                handshake.message_seq = ++_this.lastSentSeqNum;
            }
            _this.sendHandshakeMessage(handshake, retransmit);
        });
    };
    /**
     * Fragments a handshake message, serializes the fragements into single messages and sends them over the record layer.
     * Don't call this directly, rather use *sendFlight*
     * @param handshake - The handshake message to be sent
     */
    ClientHandshakeHandler.prototype.sendHandshakeMessage = function (handshake, retransmit) {
        // fragment the messages to send them over the record layer
        var messages = handshake
            .fragmentMessage()
            .map(function (fragment) { return ({
            type: ContentType_1.ContentType.handshake,
            data: fragment.serialize()
        }); });
        this.recordLayer.sendAll(messages);
        // if this is not a retransmit, also remember the raw data for verification purposes
        if (!retransmit) {
            this.bufferHandshakeData(handshake);
        }
    };
    /**
     * remembers the raw data of handshake messages for verification purposes
     * @param messages - the messages to be remembered
     */
    ClientHandshakeHandler.prototype.bufferHandshakeData = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        // remember data up to now
        var buffers = [];
        if (this.allHandshakeData != null)
            buffers.push(this.allHandshakeData);
        // stript out hello requests
        messages = messages.filter(function (m) { return m.msg_type !== Handshake.HandshakeType.hello_request; });
        // and add the raw data
        buffers.push(messages.map(function (m) { return m.serialize(); }));
        this.allHandshakeData = Buffer.concat(buffers);
    };
    /**
     * computes the verify data for a Finished message
     * @param handshakeMessages - the concatenated messages received so far
     */
    ClientHandshakeHandler.prototype.computeVerifyData = function (handshakeMessages, source) {
        var connState = this.recordLayer.nextEpoch.connectionState;
        var PRF_fn = PRF_1.PRF[connState.cipherSuite.prfAlgorithm];
        var handshakeHash = PRF_fn.hashFunction(handshakeMessages);
        // and use it to compute the verify data
        var verify_data = PRF_fn(connState.master_secret, source + " finished", handshakeHash, connState.cipherSuite.verify_data_length);
        return verify_data;
    };
    /**
     * Sends a ChangeCipherSpec message
     */
    ClientHandshakeHandler.prototype.sendChangeCipherSpecMessage = function () {
        var message = {
            type: ContentType_1.ContentType.change_cipher_spec,
            data: (ChangeCipherSpec_1.ChangeCipherSpec.createEmpty()).serialize()
        };
        this.recordLayer.send(message);
        // advance the write epoch, so we use the new params for sending the next messages
        this.recordLayer.advanceWriteEpoch();
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