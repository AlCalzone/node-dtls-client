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
var CipherSuite_1 = require("../TLS/CipherSuite");
var ConnectionState_1 = require("../TLS/ConnectionState");
var Extension_1 = require("../TLS/Extension");
var ProtocolVersion_1 = require("../TLS/ProtocolVersion");
var Random_1 = require("../TLS/Random");
var SessionID_1 = require("../TLS/SessionID");
var TLSStruct_1 = require("../TLS/TLSStruct");
var TypeSpecs = require("../TLS/TypeSpecs");
var Cookie_1 = require("./Cookie");
var RecordLayer_1 = require("./RecordLayer");
var HandshakeType;
(function (HandshakeType) {
    HandshakeType[HandshakeType["hello_request"] = 0] = "hello_request";
    HandshakeType[HandshakeType["client_hello"] = 1] = "client_hello";
    HandshakeType[HandshakeType["server_hello"] = 2] = "server_hello";
    HandshakeType[HandshakeType["hello_verify_request"] = 3] = "hello_verify_request";
    HandshakeType[HandshakeType["certificate"] = 11] = "certificate";
    HandshakeType[HandshakeType["server_key_exchange"] = 12] = "server_key_exchange";
    HandshakeType[HandshakeType["certificate_request"] = 13] = "certificate_request";
    HandshakeType[HandshakeType["server_hello_done"] = 14] = "server_hello_done";
    HandshakeType[HandshakeType["certificate_verify"] = 15] = "certificate_verify";
    HandshakeType[HandshakeType["client_key_exchange"] = 16] = "client_key_exchange";
    HandshakeType[HandshakeType["finished"] = 20] = "finished";
})(HandshakeType = exports.HandshakeType || (exports.HandshakeType = {}));
var Handshake = /** @class */ (function (_super) {
    __extends(Handshake, _super);
    function Handshake(msg_type, bodySpec, initial) {
        var _this = _super.call(this, bodySpec, initial) || this;
        _this.msg_type = msg_type;
        return _this;
    }
    /**
     * Converts this Handshake message into a fragment ready to be sent
     */
    Handshake.prototype.toFragment = function () {
        // spec only contains the body, so serialize() will only return that
        var body = this.serialize();
        return new FragmentedHandshake(this.msg_type, body.length, this.message_seq, 0, body);
    };
    /**
     * Parses a re-assembled handshake message into the correct object struture
     * @param assembled - the re-assembled (or never-fragmented) message
     */
    Handshake.fromFragment = function (assembled) {
        if (assembled.isFragmented()) {
            throw new Error("the message to be parsed MUST NOT be fragmented");
        }
        if (exports.HandshakeMessages[assembled.msg_type] != undefined) {
            // find the right type for the body object
            var msgClass = exports.HandshakeMessages[assembled.msg_type];
            // turn it into the correct type
            var spec = TypeSpecs.define.Struct(msgClass);
            // parse the body object into a new Handshake instance
            var ret = TLSStruct_1.TLSStruct.from(spec, assembled.fragment).result;
            ret.message_seq = assembled.message_seq;
            return ret;
        }
        else {
            throw new Error("unsupported message type " + assembled.msg_type);
        }
    };
    return Handshake;
}(TLSStruct_1.TLSStruct));
exports.Handshake = Handshake;
var FragmentedHandshake = /** @class */ (function (_super) {
    __extends(FragmentedHandshake, _super);
    function FragmentedHandshake(msg_type, total_length, message_seq, fragment_offset, fragment) {
        var _this = _super.call(this, FragmentedHandshake.__spec) || this;
        _this.msg_type = msg_type;
        _this.total_length = total_length;
        _this.message_seq = message_seq;
        _this.fragment_offset = fragment_offset;
        _this.fragment = fragment;
        return _this;
    }
    FragmentedHandshake.createEmpty = function () {
        return new FragmentedHandshake(null, null, null, null, null);
    };
    /**
     * Checks if this message is actually fragmented, i.e. total_length > fragment_length
     */
    FragmentedHandshake.prototype.isFragmented = function () {
        return (this.fragment_offset !== 0) || (this.total_length > this.fragment.length);
    };
    /**
     * Enforces an array of fragments to belong to a single message
     * @throws Throws an error if the fragements belong to multiple messages. Passes otherwise.
     */
    FragmentedHandshake.enforceSingleMessage = function (fragments) {
        // check if we are looking at a single message, i.e. compare type, seq_num and length
        var singleMessage = fragments.every(function (val, i, arr) {
            if (i > 0) {
                return val.msg_type === arr[0].msg_type &&
                    val.message_seq === arr[0].message_seq &&
                    val.total_length === arr[0].total_length;
            }
            return true;
        });
        if (!singleMessage) {
            throw new Error("this series of fragments belongs to multiple messages");
        }
    };
    /**
     * In the given array of fragments, find all that belong to the reference fragment
     * @param fragments - Array of fragments to be searched
     * @param reference - The reference fragment whose siblings should be found
     */
    FragmentedHandshake.findAllFragments = function (fragments, reference) {
        // ignore empty arrays
        if (!(fragments && fragments.length))
            return [];
        // return all fragments with matching msg_type, message_seq and total length
        return fragments.filter(function (f) {
            return f.msg_type === reference.msg_type &&
                f.message_seq === reference.message_seq &&
                f.total_length === reference.total_length;
        });
    };
    /**
     * Checks if the provided handshake fragments form a complete message
     */
    FragmentedHandshake.isComplete = function (fragments) {
        // ignore empty arrays
        if (!(fragments && fragments.length))
            return false;
        FragmentedHandshake.enforceSingleMessage(fragments);
        var firstSeqNum = fragments[0].message_seq;
        var totalLength = fragments[0].total_length;
        var ranges = fragments
            // map to fragment range (start and end index)
            .map(function (f) { return ({ start: f.fragment_offset, end: f.fragment_offset + f.fragment.length - 1 }); })
            // order the fragments by fragment offset
            .sort(function (a, b) { return a.start - b.start; });
        // check if the fragments have no holes
        var noHoles = ranges.every(function (val, i, arr) {
            if (i === 0) {
                // first fragment should start at 0
                if (val.start !== 0)
                    return false;
            }
            else {
                // every other fragment should touch or overlap the previous one
                if (val.start - arr[i - 1].end > 1)
                    return false;
            }
            // last fragment should end at totalLength-1
            if (i === arr.length - 1) {
                if (val.end !== totalLength - 1)
                    return false;
            }
            // no problems
            return true;
        });
        return noHoles;
    };
    /**
     * Fragments this packet into a series of packets according to the configured MTU
     * @returns An array of fragmented handshake messages - or a single one if it is small enough.
     */
    FragmentedHandshake.prototype.split = function (maxFragmentLength) {
        var start = 0;
        var totalLength = this.fragment.length;
        var fragments = [];
        if (maxFragmentLength == null) {
            maxFragmentLength = RecordLayer_1.RecordLayer.MAX_PAYLOAD_SIZE - FragmentedHandshake.headerLength;
        }
        // loop through the message and fragment it
        while (!fragments.length && start < totalLength) {
            // calculate maximum length, limited by MTU - IP/UDP headers - handshake overhead
            var fragmentLength = Math.min(maxFragmentLength, totalLength - start);
            // slice and dice
            var data = Buffer.from(this.fragment.slice(start, start + fragmentLength));
            if (data.length <= 0) {
                // this shouldn't happen, but we don't want to introduce an infinite loop
                throw new Error("Zero or less bytes processed while fragmenting handshake message.");
            }
            // create the message
            fragments.push(new FragmentedHandshake(this.msg_type, totalLength, this.message_seq, start, data));
            // step forward by the actual fragment length
            start += data.length;
        }
        return fragments;
    };
    /**
     * Reassembles a series of fragmented handshake messages into a complete one.
     * Warning: doesn't check for validity, do that in advance!
     */
    FragmentedHandshake.reassemble = function (messages) {
        // cannot reassemble empty arrays
        if (!(messages && messages.length)) {
            throw new Error("cannot reassemble handshake from empty array");
        }
        // sort by fragment start
        messages = messages.sort(function (a, b) { return a.fragment_offset - b.fragment_offset; });
        // combine into a single buffer
        var combined = Buffer.allocUnsafe(messages[0].total_length);
        for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
            var msg = messages_1[_i];
            msg.fragment.copy(combined, msg.fragment_offset);
        }
        // and return the complete message
        return new FragmentedHandshake(messages[0].msg_type, messages[0].total_length, messages[0].message_seq, 0, combined);
    };
    FragmentedHandshake.__spec = {
        msg_type: TypeSpecs.define.Enum("uint8", HandshakeType),
        total_length: TypeSpecs.uint24,
        message_seq: TypeSpecs.uint16,
        fragment_offset: TypeSpecs.uint24,
        fragment: TypeSpecs.define.Buffer(0, Math.pow(2, 24) - 1),
    };
    FragmentedHandshake.spec = TypeSpecs.define.Struct(FragmentedHandshake);
    /**
     * The amount of data consumed by a handshake message header (without the actual fragment)
     */
    FragmentedHandshake.headerLength = 1 + 3 + 2 + 3 + 3; // TODO: dynamisch?
    return FragmentedHandshake;
}(TLSStruct_1.TLSStruct));
exports.FragmentedHandshake = FragmentedHandshake;
// Handshake message implementations
var HelloRequest = /** @class */ (function (_super) {
    __extends(HelloRequest, _super);
    function HelloRequest() {
        return _super.call(this, HandshakeType.hello_request, HelloRequest.__spec) || this;
    }
    HelloRequest.createEmpty = function () {
        return new HelloRequest();
    };
    HelloRequest.__spec = {};
    return HelloRequest;
}(Handshake));
exports.HelloRequest = HelloRequest;
var ClientHello = /** @class */ (function (_super) {
    __extends(ClientHello, _super);
    function ClientHello(client_version, random, session_id, cookie, cipher_suites, compression_methods, extensions) {
        var _this = _super.call(this, HandshakeType.client_hello, ClientHello.__spec) || this;
        _this.client_version = client_version;
        _this.random = random;
        _this.session_id = session_id;
        _this.cookie = cookie;
        _this.cipher_suites = cipher_suites;
        _this.compression_methods = compression_methods;
        _this.extensions = extensions;
        return _this;
    }
    ClientHello.createEmpty = function () {
        return new ClientHello(null, null, null, null, null, null, null);
    };
    ClientHello.__spec = {
        client_version: TypeSpecs.define.Struct(ProtocolVersion_1.ProtocolVersion),
        random: TypeSpecs.define.Struct(Random_1.Random),
        session_id: SessionID_1.SessionID.spec,
        cookie: Cookie_1.Cookie.spec,
        cipher_suites: TypeSpecs.define.Vector(CipherSuite_1.CipherSuite.__spec.id, 2, Math.pow(2, 16) - 2),
        compression_methods: TypeSpecs.define.Vector(ConnectionState_1.CompressionMethod.spec, 1, Math.pow(2, 8) - 1),
        extensions: TypeSpecs.define.Vector(Extension_1.Extension.spec, 0, Math.pow(2, 16) - 1, true),
    };
    return ClientHello;
}(Handshake));
exports.ClientHello = ClientHello;
var ServerHello = /** @class */ (function (_super) {
    __extends(ServerHello, _super);
    function ServerHello(server_version, random, session_id, cipher_suite, compression_method, extensions) {
        var _this = _super.call(this, HandshakeType.server_hello, ServerHello.__spec) || this;
        _this.server_version = server_version;
        _this.random = random;
        _this.session_id = session_id;
        _this.cipher_suite = cipher_suite;
        _this.compression_method = compression_method;
        _this.extensions = extensions;
        return _this;
    }
    ServerHello.createEmpty = function () {
        return new ServerHello(null, null, null, null, null, null);
    };
    ServerHello.__spec = {
        server_version: TypeSpecs.define.Struct(ProtocolVersion_1.ProtocolVersion),
        random: TypeSpecs.define.Struct(Random_1.Random),
        session_id: SessionID_1.SessionID.spec,
        cipher_suite: CipherSuite_1.CipherSuite.__spec.id,
        compression_method: ConnectionState_1.CompressionMethod.spec,
        extensions: TypeSpecs.define.Vector(Extension_1.Extension.spec, 0, Math.pow(2, 16) - 1, true),
    };
    return ServerHello;
}(Handshake));
exports.ServerHello = ServerHello;
var HelloVerifyRequest = /** @class */ (function (_super) {
    __extends(HelloVerifyRequest, _super);
    function HelloVerifyRequest(server_version, cookie) {
        var _this = _super.call(this, HandshakeType.hello_verify_request, HelloVerifyRequest.__spec) || this;
        _this.server_version = server_version;
        _this.cookie = cookie;
        return _this;
    }
    HelloVerifyRequest.createEmpty = function () {
        return new HelloVerifyRequest(null, null);
    };
    HelloVerifyRequest.__spec = {
        server_version: TypeSpecs.define.Struct(ProtocolVersion_1.ProtocolVersion),
        cookie: Cookie_1.Cookie.spec,
    };
    return HelloVerifyRequest;
}(Handshake));
exports.HelloVerifyRequest = HelloVerifyRequest;
var ServerKeyExchange = /** @class */ (function (_super) {
    __extends(ServerKeyExchange, _super);
    function ServerKeyExchange() {
        return _super.call(this, HandshakeType.server_key_exchange, ServerKeyExchange.__spec) || this;
    }
    ServerKeyExchange.createEmpty = function () {
        return new ServerKeyExchange();
    };
    ServerKeyExchange.__spec = {
        raw_data: TypeSpecs.define.Buffer(),
    };
    return ServerKeyExchange;
}(Handshake));
exports.ServerKeyExchange = ServerKeyExchange;
var ServerKeyExchange_PSK = /** @class */ (function (_super) {
    __extends(ServerKeyExchange_PSK, _super);
    function ServerKeyExchange_PSK(psk_identity_hint) {
        var _this = _super.call(this, ServerKeyExchange_PSK.__spec) || this;
        _this.psk_identity_hint = psk_identity_hint;
        return _this;
    }
    ServerKeyExchange_PSK.createEmpty = function () {
        return new ServerKeyExchange_PSK(null);
    };
    ServerKeyExchange_PSK.__spec = {
        psk_identity_hint: TypeSpecs.define.Buffer(0, Math.pow(2, 16) - 1),
    };
    ServerKeyExchange_PSK.spec = TypeSpecs.define.Struct(ServerKeyExchange_PSK);
    return ServerKeyExchange_PSK;
}(TLSStruct_1.TLSStruct));
exports.ServerKeyExchange_PSK = ServerKeyExchange_PSK;
var ClientKeyExchange = /** @class */ (function (_super) {
    __extends(ClientKeyExchange, _super);
    function ClientKeyExchange() {
        return _super.call(this, HandshakeType.client_key_exchange, ClientKeyExchange.__spec) || this;
    }
    ClientKeyExchange.createEmpty = function () {
        return new ClientKeyExchange();
    };
    ClientKeyExchange.__spec = {
        raw_data: TypeSpecs.define.Buffer(),
    };
    return ClientKeyExchange;
}(Handshake));
exports.ClientKeyExchange = ClientKeyExchange;
var ClientKeyExchange_PSK = /** @class */ (function (_super) {
    __extends(ClientKeyExchange_PSK, _super);
    function ClientKeyExchange_PSK(psk_identity) {
        var _this = _super.call(this, ClientKeyExchange_PSK.__spec) || this;
        _this.psk_identity = psk_identity;
        return _this;
    }
    ClientKeyExchange_PSK.createEmpty = function () {
        return new ClientKeyExchange_PSK(null);
    };
    ClientKeyExchange_PSK.__spec = {
        psk_identity: TypeSpecs.define.Buffer(0, Math.pow(2, 16) - 1),
    };
    ClientKeyExchange_PSK.spec = TypeSpecs.define.Struct(ClientKeyExchange_PSK);
    return ClientKeyExchange_PSK;
}(TLSStruct_1.TLSStruct));
exports.ClientKeyExchange_PSK = ClientKeyExchange_PSK;
var ServerHelloDone = /** @class */ (function (_super) {
    __extends(ServerHelloDone, _super);
    function ServerHelloDone() {
        return _super.call(this, HandshakeType.server_hello_done, ServerHelloDone.__spec) || this;
    }
    ServerHelloDone.createEmpty = function () {
        return new ServerHelloDone();
    };
    ServerHelloDone.__spec = {};
    return ServerHelloDone;
}(Handshake));
exports.ServerHelloDone = ServerHelloDone;
var Finished = /** @class */ (function (_super) {
    __extends(Finished, _super);
    function Finished(verify_data) {
        var _this = _super.call(this, HandshakeType.finished, Finished.__spec) || this;
        _this.verify_data = verify_data;
        return _this;
    }
    Finished.createEmpty = function () {
        return new Finished(null);
    };
    Finished.__spec = {
        verify_data: TypeSpecs.define.Buffer(),
    };
    return Finished;
}(Handshake));
exports.Finished = Finished;
// define handshake messages for lookup
exports.HandshakeMessages = {};
exports.HandshakeMessages[HandshakeType.hello_request] = HelloRequest;
exports.HandshakeMessages[HandshakeType.client_hello] = ClientHello;
exports.HandshakeMessages[HandshakeType.server_hello] = ServerHello;
exports.HandshakeMessages[HandshakeType.hello_verify_request] = HelloVerifyRequest;
exports.HandshakeMessages[HandshakeType.server_hello_done] = ServerHelloDone;
exports.HandshakeMessages[HandshakeType.finished] = Finished;
