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
var TypeSpecs = require("../TLS/TypeSpecs");
var TLSStruct_1 = require("../TLS/TLSStruct");
var Random_1 = require("../TLS/Random");
var SessionID_1 = require("../TLS/SessionID");
var Cookie_1 = require("./Cookie");
var CipherSuite_1 = require("../TLS/CipherSuite");
var ConnectionState_1 = require("../TLS/ConnectionState");
var ProtocolVersion_1 = require("../TLS/ProtocolVersion");
var Extension_1 = require("../TLS/Extension");
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
var Handshake = (function (_super) {
    __extends(Handshake, _super);
    function Handshake(msg_type, bodySpec, initial) {
        var _this = _super.call(this, bodySpec, initial) || this;
        _this.msg_type = msg_type;
        return _this;
    }
    /**
     * Fragments this packet into a series of packets according to the configured MTU
     * @returns An array of fragmented handshake messages - or a single one if it is small enough.
     */
    Handshake.prototype.fragmentMessage = function () {
        // spec only contains the body, so serialize() will only return that
        var wholeMessage = this.serialize();
        var start = 0;
        var fragments = [];
        var maxFragmentLength = RecordLayer_1.RecordLayer.MAX_PAYLOAD_SIZE - FragmentedHandshake.headerLength;
        // loop through the message and fragment it
        while (!fragments.length && start < wholeMessage.length) {
            // calculate maximum length, limited by MTU - IP/UDP headers - handshake overhead
            var fragmentLength = Math.min(maxFragmentLength, wholeMessage.length - start);
            // slice and dice
            var fragment = wholeMessage.slice(start, start + fragmentLength);
            //create the message
            fragments.push(new FragmentedHandshake(this.msg_type, wholeMessage.length, this.message_seq, start, fragment));
            // step forward by the actual fragment length
            start += fragment.length;
        }
        return fragments;
    };
    /**
     * Parses a re-assembled handshake message into the correct object struture
     * @param assembled - the re-assembled (or never-fragmented) message
     */
    Handshake.parse = function (assembled) {
        if (assembled.isFragmented())
            throw new Error("the message to be parsed MUST NOT be fragmented");
        if (exports.HandshakeMessages[assembled.msg_type] != undefined) {
            // find the right type for the body object
            var msgClass = exports.HandshakeMessages[assembled.msg_type];
            // extract the struct spec
            var __spec = msgClass.__spec; // we can expect this to exist
            // turn it into the correct type
            var spec = TypeSpecs.define.Struct(__spec);
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
var FragmentedHandshake = (function (_super) {
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
    /**
     * Checks if this message is actually fragmented, i.e. total_length > fragment_length
     */
    FragmentedHandshake.prototype.isFragmented = function () {
        return (this.fragment_offset !== 0) || (this.total_length > this.fragment.length);
    };
    /**
     * Enforces an array of fragments to belong to a single message
     * @throws Error
     */
    // TODO: error Documentation ^^ ?
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
        if (!singleMessage)
            throw new Error('this series of fragments belongs to multiple messages'); // TODO: better type?		
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
            .map(function (f) { return ({ start: f.fragment_offset, end: f.fragment_offset + f.fragment.length - 1 }); })
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
     * Reassembles a series of fragmented handshake messages into a complete one.
     * Warning: doesn't check for validity, do that in advance!
     */
    FragmentedHandshake.reassemble = function (messages) {
        // cannot reassemble empty arrays
        if (!(messages && messages.length))
            throw new Error("cannot reassemble handshake from empty array"); // TODO: Better type?
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
    return FragmentedHandshake;
}(TLSStruct_1.TLSStruct));
FragmentedHandshake.__spec = {
    msg_type: TypeSpecs.define.Enum("uint8", HandshakeType),
    total_length: TypeSpecs.uint24,
    message_seq: TypeSpecs.uint16,
    fragment_offset: TypeSpecs.uint24,
    // uint24 fragment_length is implied in the variable size vector
    fragment: TypeSpecs.define.Vector(TypeSpecs.uint8, 0, Math.pow(2, 24) - 1)
};
FragmentedHandshake.spec = TypeSpecs.define.Struct(FragmentedHandshake.__spec);
/**
 * The amount of data consumed by a handshake message header (without the actual fragment)
 */
FragmentedHandshake.headerLength = 1 + 3 + 2 + 3 + 3; // TODO: dynamisch?
exports.FragmentedHandshake = FragmentedHandshake;
// Handshake message implementations
var HelloRequest = (function (_super) {
    __extends(HelloRequest, _super);
    function HelloRequest() {
        return _super.call(this, HandshakeType.hello_request, HelloRequest.__spec) || this;
    }
    return HelloRequest;
}(Handshake));
HelloRequest.__spec = {};
exports.HelloRequest = HelloRequest;
var ClientHello = (function (_super) {
    __extends(ClientHello, _super);
    function ClientHello() {
        return _super.call(this, HandshakeType.client_hello, ClientHello.__spec) || this;
    }
    return ClientHello;
}(Handshake));
ClientHello.__spec = {
    client_version: TypeSpecs.define.Struct(ProtocolVersion_1.ProtocolVersion),
    random: TypeSpecs.define.Struct(Random_1.Random),
    session_id: SessionID_1.SessionID.spec,
    cookie: Cookie_1.Cookie.spec,
    cipher_suites: TypeSpecs.define.Vector(CipherSuite_1.CipherSuite.spec, 2, Math.pow(2, 16) - 2),
    compression_methods: TypeSpecs.define.Vector(ConnectionState_1.CompressionMethod.spec, 1, Math.pow(2, 8) - 1),
    extensions: TypeSpecs.define.Vector(Extension_1.Extension.spec, 0, Math.pow(2, 16) - 1, true),
};
exports.ClientHello = ClientHello;
var ServerHello = (function (_super) {
    __extends(ServerHello, _super);
    function ServerHello() {
        return _super.call(this, HandshakeType.server_hello, ServerHello.__spec) || this;
    }
    return ServerHello;
}(Handshake));
ServerHello.__spec = {
    server_version: TypeSpecs.define.Struct(ProtocolVersion_1.ProtocolVersion),
    random: TypeSpecs.define.Struct(Random_1.Random),
    session_id: SessionID_1.SessionID.spec,
    cipher_suite: TypeSpecs.define.Struct(CipherSuite_1.CipherSuite),
    compression_method: ConnectionState_1.CompressionMethod.spec,
    extensions: TypeSpecs.define.Vector(Extension_1.Extension.spec, 0, Math.pow(2, 16) - 1, true),
};
exports.ServerHello = ServerHello;
var HelloVerifyRequest = (function (_super) {
    __extends(HelloVerifyRequest, _super);
    function HelloVerifyRequest() {
        return _super.call(this, HandshakeType.hello_verify_request, HelloVerifyRequest.__spec) || this;
    }
    return HelloVerifyRequest;
}(Handshake));
HelloVerifyRequest.__spec = {
    server_version: TypeSpecs.define.Struct(ProtocolVersion_1.ProtocolVersion),
    cookie: Cookie_1.Cookie.spec
};
exports.HelloVerifyRequest = HelloVerifyRequest;
var ServerHelloDone = (function (_super) {
    __extends(ServerHelloDone, _super);
    function ServerHelloDone() {
        return _super.call(this, HandshakeType.server_hello_done, ServerHelloDone.__spec) || this;
    }
    return ServerHelloDone;
}(Handshake));
ServerHelloDone.__spec = {};
exports.ServerHelloDone = ServerHelloDone;
var Finished = (function (_super) {
    __extends(Finished, _super);
    function Finished() {
        return _super.call(this, HandshakeType.finished, Finished.__spec) || this;
    }
    return Finished;
}(Handshake));
Finished.__spec = {
    verify_data: TypeSpecs.define.Vector(TypeSpecs.uint8, 0, Math.pow(2, 16)) // TODO: wirkliche Länge "verify_data_length" herausfinden
};
exports.Finished = Finished;
// define handshake messages for lookup
exports.HandshakeMessages = {};
exports.HandshakeMessages[HandshakeType.hello_request] = HelloRequest;
exports.HandshakeMessages[HandshakeType.client_hello] = ClientHello;
exports.HandshakeMessages[HandshakeType.server_hello] = ServerHello;
exports.HandshakeMessages[HandshakeType.hello_verify_request] = HelloVerifyRequest;
exports.HandshakeMessages[HandshakeType.server_hello_done] = ServerHelloDone;
exports.HandshakeMessages[HandshakeType.finished] = Finished;
//# sourceMappingURL=Handshake.js.map