"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CipherSuites_1 = require("../DTLS/CipherSuites");
var Alert_1 = require("../TLS/Alert");
var ChangeCipherSpec_1 = require("../TLS/ChangeCipherSpec");
var ConnectionState_1 = require("../TLS/ConnectionState");
var ContentType_1 = require("../TLS/ContentType");
var PreMasterSecret_1 = require("../TLS/PreMasterSecret");
var PRF_1 = require("../TLS/PRF");
var ProtocolVersion_1 = require("../TLS/ProtocolVersion");
var Random_1 = require("../TLS/Random");
var Vector_1 = require("../TLS/Vector");
var Handshake = require("./Handshake");
var ClientHandshakeHandler = /** @class */ (function () {
    function ClientHandshakeHandler(recordLayer, options, finishedCallback) {
        var _this = this;
        this.recordLayer = recordLayer;
        this.options = options;
        this.finishedCallback = finishedCallback;
        this.bufferedOutgoingMessages = [];
        this.sendFlight_begin_wasCalled = false;
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
                            _this.recordLayer.currentWriteEpoch.connectionState.protocolVersion = hello.server_version;
                            _this.recordLayer.nextWriteEpoch.connectionState.protocolVersion = hello.server_version;
                            // TODO: parse/support extensions?
                            // TODO: remember the session id?
                            break;
                        // TODO: support more messages (certificates etc.)
                        case Handshake.HandshakeType.server_key_exchange:
                            var srvKeyExchange = msg;
                            // parse the content depending on the key exchange algorithm
                            switch (_this.recordLayer.nextEpoch.connectionState.cipherSuite.keyExchange) {
                                case "psk":
                                    var srvKeyExchange_PSK = Handshake.ServerKeyExchange_PSK.from(Handshake.ServerKeyExchange_PSK.spec, srvKeyExchange.raw_data).result;
                                    // TODO: do something with the identity hint
                                    break;
                                // TODO: support other algorithms
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
                                    var clKeyExchange = Handshake.ClientKeyExchange.createEmpty();
                                    var clKeyExchange_PSK = new Handshake.ClientKeyExchange_PSK(Buffer.from(psk_identity, "ascii"));
                                    clKeyExchange.raw_data = clKeyExchange_PSK.serialize();
                                    // and add it to the flight
                                    flight.push(clKeyExchange);
                                    // now we have everything, construct the pre master secret
                                    var psk = Buffer.from(_this.options.psk[psk_identity], "ascii");
                                    preMasterSecret = new PreMasterSecret_1.PreMasterSecret(null, psk);
                                    break;
                                default:
                                    _this.finishedCallback(new Alert_1.Alert(Alert_1.AlertLevel.fatal, Alert_1.AlertDescription.handshake_failure), new Error(connState.cipherSuite.keyExchange + " key exchange not implemented"));
                                    return;
                            }
                            // we now have everything to compute the master secret
                            connState.computeMasterSecret(preMasterSecret);
                            // in order to build the finished message, we need to process the partial flight so far
                            _this.sendFlight_begin();
                            _this.sendFlight_processPartial(flight);
                            // now we can compute the verify_data
                            var handshake_messages = Buffer.concat(_this.allHandshakeData);
                            var verify_data = _this.computeVerifyData(handshake_messages, "client");
                            // now build the finished message and process it
                            var finished = new Handshake.Finished(verify_data);
                            _this.sendFlight_processPartial([finished]);
                            // finish sending the flight
                            _this.sendFlight_finish([Handshake.HandshakeType.finished]);
                            break;
                    }
                }
            },
            /** Handles a Finished flight */
            _a[Handshake.HandshakeType.finished] = function (messages) {
                // this flight should only contain a single message (server->client),
                // but to be sure extract the last one
                var finished = messages[messages.length - 1];
                // compute the expected verify data
                var handshake_messages = Buffer.concat(_this.allHandshakeData);
                var expectedVerifyData = _this.computeVerifyData(handshake_messages, "server");
                if (finished.verify_data.equals(expectedVerifyData)) {
                    // all good!
                    _this._isHandshaking = false;
                    _this.finishedCallback();
                }
                else {
                    _this._isHandshaking = false;
                    _this.finishedCallback(new Alert_1.Alert(Alert_1.AlertLevel.fatal, Alert_1.AlertDescription.decrypt_error), new Error("DTLS handshake failed"));
                    // connection is automatically canceled by the callback
                }
            },
            _a);
        this.renegotiate();
        var _a;
    }
    Object.defineProperty(ClientHandshakeHandler.prototype, "isHandshaking", {
        get: function () {
            return this._isHandshaking;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * (Re)negotiates a DTLS session. Is automatically called when the Handshake handler is created
     */
    ClientHandshakeHandler.prototype.renegotiate = function () {
        // reset variables
        // this._state = HandshakeStates.preparing;
        this._isHandshaking = true;
        this.lastProcessedSeqNum = -1;
        this.lastSentSeqNum = -1;
        this.incompleteMessages = [];
        this.completeMessages = {};
        this.expectedResponses = [];
        this.allHandshakeData = [];
        // this.cscReceived = false;
        // this.serverFinishedPending = false;
        // ==============================
        // start by sending a ClientHello
        var hello = Handshake.ClientHello.createEmpty();
        hello.client_version = new ProtocolVersion_1.ProtocolVersion(~1, ~2);
        hello.random = Random_1.Random.createNew();
        // remember this for crypto stuff
        this.recordLayer.nextEpoch.connectionState.client_random = hello.random.serialize();
        hello.session_id = Buffer.from([]);
        hello.cookie = Buffer.from([]);
        // TODO: dynamically check which ones we can support
        var cipherSuites = this.options.ciphers || [
            "TLS_PSK_WITH_3DES_EDE_CBC_SHA",
            "TLS_PSK_WITH_AES_128_CBC_SHA",
            "TLS_PSK_WITH_AES_256_CBC_SHA",
            "TLS_PSK_WITH_AES_128_CBC_SHA256",
            "TLS_PSK_WITH_AES_256_CBC_SHA384",
            "TLS_PSK_WITH_AES_128_GCM_SHA256",
            "TLS_PSK_WITH_AES_256_GCM_SHA384",
            "TLS_PSK_WITH_AES_128_CCM",
            "TLS_PSK_WITH_AES_256_CCM",
            "TLS_PSK_WITH_AES_128_CCM_8",
            "TLS_PSK_WITH_AES_256_CCM_8",
        ];
        hello.cipher_suites = new Vector_1.Vector(cipherSuites.map(function (cs) { return CipherSuites_1.CipherSuites[cs].id; }));
        hello.compression_methods = new Vector_1.Vector([ConnectionState_1.CompressionMethod.null]);
        hello.extensions = new Vector_1.Vector();
        this.sendFlight([hello], [
            Handshake.HandshakeType.server_hello_done,
            Handshake.HandshakeType.hello_verify_request,
        ]);
    };
    // special cases for reordering of "Finished" flights
    // TODO: add these special cases to general handling functions
    // private cscReceived: boolean;
    // private serverFinishedPending: boolean;
    /**
     * Processes a received handshake message
     */
    ClientHandshakeHandler.prototype.processIncomingMessage = function (msg) {
        var _this = this;
        var checkFlight;
        if (msg.isFragmented()) {
            // remember incomplete messages and try to assemble them afterwards
            this.incompleteMessages.push(msg);
            checkFlight = this.tryAssembleFragments(msg);
        }
        else {
            // the message is already complete, we only need to parse it
            this.completeMessages[msg.message_seq] = Handshake.Handshake.fromFragment(msg);
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
                    if (lastMsg.msg_type === Handshake.HandshakeType.finished) {
                        // for the finished flight, only buffer the finished message AFTER handling it
                        this.bufferHandshakeData.apply(this, (messages.slice(0, -1)
                            .filter(function (m) { return _this.needsToHashMessage(m); })
                            .map(function (m) { return m.toFragment(); }) // TODO: avoid unneccessary assembly and fragmentation of messages
                        ));
                    }
                    else {
                        this.bufferHandshakeData.apply(this, (messages
                            .filter(function (m) { return _this.needsToHashMessage(m); })
                            .map(function (m) { return m.toFragment(); }) // TODO: avoid unneccessary assembly and fragmentation of messages
                        ));
                    }
                    // handle the message
                    try {
                        this.handle[lastMsg.msg_type](messages);
                    }
                    catch (e) {
                        this._isHandshaking = false;
                        this.finishedCallback(null, e);
                        return;
                    }
                    if (lastMsg.msg_type === Handshake.HandshakeType.finished) {
                        // for the finished flight, only buffer the finished message AFTER handling it
                        this.bufferHandshakeData(lastMsg.toFragment());
                    }
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
            this.completeMessages[reassembled.message_seq] = Handshake.Handshake.fromFragment(reassembled);
            // and remove the other ones from the list of incomplete ones
            this.incompleteMessages = this.incompleteMessages.filter(function (fragment) { return allFragments.indexOf(fragment) === -1; });
            return true;
        }
        return false;
    };
    ClientHandshakeHandler.prototype.sendFlight_begin = function () {
        this.sendFlight_begin_wasCalled = true;
        this.lastFlight = [];
    };
    /**
     * Processes a flight (including giving the messages a seq_num), but does not actually send it.
     * @param flight - The flight to be sent.
     * @param retransmit - If the flight is retransmitted, i.e. no sequence numbers are increased
     */
    ClientHandshakeHandler.prototype.sendFlight_processPartial = function (flight, retransmit) {
        var _this = this;
        if (retransmit === void 0) { retransmit = false; }
        if (!this.sendFlight_begin_wasCalled) {
            throw new Error("Need to call sendFlight_beginPartial() before using this function");
        }
        (_a = this.lastFlight).push.apply(_a, flight);
        flight.forEach(function (handshake) {
            if (handshake.msg_type === Handshake.HandshakeType.finished) {
                // before finished messages, ALWAYS send a ChangeCipherSpec
                _this.bufferedOutgoingMessages.push({
                    type: ContentType_1.ContentType.change_cipher_spec,
                    data: (ChangeCipherSpec_1.ChangeCipherSpec.createEmpty()).serialize(),
                });
                // TODO: how do we handle retransmission here?
            }
            if (!retransmit) {
                // for first-time messages, increment the sequence number
                handshake.message_seq = ++_this.lastSentSeqNum;
            }
            var fragment = handshake.toFragment();
            if (!retransmit) {
                // for first-time messages, buffer the data for verification purposes
                if (_this.needsToHashMessage(handshake)) {
                    _this.bufferHandshakeData(fragment);
                }
            }
            // fragment the messages (TODO: make this dependent on previous messages in this flight)
            var fragments = fragment
                .split()
                .map(function (f) { return ({
                type: ContentType_1.ContentType.handshake,
                data: f.serialize(),
            }); });
            (_a = _this.bufferedOutgoingMessages).push.apply(_a, fragments);
            var _a;
        });
        var _a;
    };
    /**
     * Sends the currently buffered flight of messages
     * @param flight The flight to be sent.
     * @param expectedResponses The types of possible responses we are expecting.
     * @param retransmit If the flight is retransmitted, i.e. no sequence numbers are increased
     */
    ClientHandshakeHandler.prototype.sendFlight_finish = function (expectedResponses) {
        this.expectedResponses = expectedResponses;
        this.recordLayer.sendFlight(this.bufferedOutgoingMessages);
        // clear the buffers for future use
        this.bufferedOutgoingMessages = [];
        this.sendFlight_begin_wasCalled = false;
    };
    /**
     * Sends the given flight of messages and remembers it for potential retransmission
     * @param flight The flight to be sent.
     * @param expectedResponses The types of possible responses we are expecting.
     * @param retransmit If the flight is retransmitted, i.e. no sequence numbers are increased
     */
    ClientHandshakeHandler.prototype.sendFlight = function (flight, expectedResponses, retransmit) {
        if (retransmit === void 0) { retransmit = false; }
        // this is actually just a convenience function for sending complete flights
        this.sendFlight_begin();
        this.sendFlight_processPartial(flight, retransmit);
        this.sendFlight_finish(expectedResponses);
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
        (_a = this.allHandshakeData).push.apply(_a, (messages.map(function (m) { return m.serialize(); })));
        var _a;
    };
    /**
     * For a given message, check if it needs to be hashed
     */
    ClientHandshakeHandler.prototype.needsToHashMessage = function (message) {
        switch (message.msg_type) {
            // hello (verify) requests
            case Handshake.HandshakeType.hello_verify_request: return false;
            case Handshake.HandshakeType.hello_request: return false;
            // client hello without cookie (TODO only if verify request is used)
            case Handshake.HandshakeType.client_hello:
                var cookie = message.cookie;
                return (cookie != null) && (cookie.length > 0);
            // everything else will be hashed
            default: return true;
        }
    };
    /**
     * computes the verify data for a Finished message
     * @param handshakeMessages - the concatenated messages received so far
     */
    ClientHandshakeHandler.prototype.computeVerifyData = function (handshakeMessages, source) {
        var connState = (source === "client")
            ? this.recordLayer.nextWriteEpoch.connectionState
            : this.recordLayer.currentReadEpoch.connectionState;
        var PRF_fn = PRF_1.PRF[connState.cipherSuite.prfAlgorithm];
        var handshakeHash = PRF_fn.hashFunction(handshakeMessages);
        // and use it to compute the verify data
        var verify_data = PRF_fn(connState.master_secret, source + " finished", handshakeHash, connState.cipherSuite.verify_data_length);
        return verify_data;
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
