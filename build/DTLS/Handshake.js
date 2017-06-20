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
var TLSTypes = require("../TLS/TLSTypes");
var TLSStruct_1 = require("../TLS/TLSStruct");
var object_polyfill_1 = require("../lib/object-polyfill");
var Random_1 = require("../TLS/Random");
var SessionID_1 = require("../TLS/SessionID");
var Cookie_1 = require("./Cookie");
var CipherSuite_1 = require("../TLS/CipherSuite");
var ConnectionState_1 = require("../TLS/ConnectionState");
var ProtocolVersion_1 = require("../TLS/ProtocolVersion");
var Handshake = (function (_super) {
    __extends(Handshake, _super);
    function Handshake(msg_type, bodySpec, body) {
        var _this = _super.call(this, bodySpec, body) || this;
        _this.msg_type = msg_type;
        _this.body = body;
        return _this;
    }
    /**
     * Fragments this packet into a series of packets according to the configured MTU
     */
    Handshake.prototype.fragmentMessage = function () {
        // spec only contains the body, so serialize() will only return that
        var wholeMessage = this.serialize();
        // TODO: fragment the message
        return [];
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
    return FragmentedHandshake;
}(TLSStruct_1.TLSStruct));
FragmentedHandshake.__spec = {
    msg_type: new TLSTypes.Enum("uint8", HandshakeType),
    total_length: "uint24",
    message_seq: "uint16",
    fragment_offset: "uint24",
    // uint24 fragment_length is implied in the variable size vector
    fragment: new TLSTypes.Vector("uint8", 0, Math.pow(2, 24) - 1)
};
exports.FragmentedHandshake = FragmentedHandshake;
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
var HelloRequest = (function (_super) {
    __extends(HelloRequest, _super);
    function HelloRequest() {
        return _super.call(this, HandshakeType.hello_request, HelloRequest.__bodySpec) || this;
    }
    return HelloRequest;
}(Handshake));
HelloRequest.__bodySpec = {};
exports.HelloRequest = HelloRequest;
var ClientHello = (function (_super) {
    __extends(ClientHello, _super);
    function ClientHello(client_version, session_id, cookie, extensions) {
        var _this = _super.call(this, HandshakeType.client_hello, extensions != undefined ? ClientHello.__bodySpecWithExtensions : ClientHello.__bodySpec) || this;
        _this.client_version = client_version;
        _this.session_id = session_id;
        _this.cookie = cookie;
        _this.extensions = extensions;
        return _this;
    }
    return ClientHello;
}(Handshake));
ClientHello.__bodySpec = {
    client_version: ProtocolVersion_1.ProtocolVersion.__spec,
    random: Random_1.Random.__spec,
    session_id: SessionID_1.SessionID.__spec,
    cookie: Cookie_1.Cookie.__spec,
};
ClientHello.__bodySpecWithExtensions = object_polyfill_1.extend(ClientHello.__bodySpec, {});
exports.ClientHello = ClientHello;
var ServerHello = (function (_super) {
    __extends(ServerHello, _super);
    function ServerHello(server_version, session_id, cipher_suite, compression_method, extensions) {
        var _this = _super.call(this, HandshakeType.server_hello, extensions != undefined ? ServerHello.__bodySpecWithExtensions : ServerHello.__bodySpec) || this;
        _this.server_version = server_version;
        _this.session_id = session_id;
        _this.cipher_suite = cipher_suite;
        _this.compression_method = compression_method;
        _this.extensions = extensions;
        return _this;
    }
    return ServerHello;
}(Handshake));
ServerHello.__bodySpec = {
    server_version: ProtocolVersion_1.ProtocolVersion.__spec,
    random: Random_1.Random.__spec,
    session_id: SessionID_1.SessionID.__spec,
    cipher_suite: CipherSuite_1.CipherSuite.__spec,
    compression_method: ConnectionState_1.CompressionMethod.__spec
};
ServerHello.__bodySpecWithExtensions = object_polyfill_1.extend(ServerHello.__bodySpec, {});
exports.ServerHello = ServerHello;
var HelloVerifyRequest = (function (_super) {
    __extends(HelloVerifyRequest, _super);
    function HelloVerifyRequest(server_version, cookie) {
        var _this = _super.call(this, HandshakeType.hello_verify_request, HelloVerifyRequest.__bodySpec) || this;
        _this.server_version = server_version;
        _this.cookie = cookie;
        return _this;
    }
    return HelloVerifyRequest;
}(Handshake));
HelloVerifyRequest.__bodySpec = {
    server_version: ProtocolVersion_1.ProtocolVersion.__spec,
    cookie: Cookie_1.Cookie.__spec
};
exports.HelloVerifyRequest = HelloVerifyRequest;
var ServerHelloDone = (function (_super) {
    __extends(ServerHelloDone, _super);
    function ServerHelloDone() {
        return _super.call(this, HandshakeType.server_hello_done, ServerHelloDone.__bodySpec) || this;
    }
    return ServerHelloDone;
}(Handshake));
ServerHelloDone.__bodySpec = {};
exports.ServerHelloDone = ServerHelloDone;
var Finished = (function (_super) {
    __extends(Finished, _super);
    function Finished(verify_data) {
        var _this = _super.call(this, HandshakeType.finished, Finished.__bodySpec) || this;
        _this.verify_data = verify_data;
        return _this;
    }
    return Finished;
}(Handshake));
Finished.__bodySpec = {
    verify_data: new TLSTypes.Vector("uint8", 0, Math.pow(2, 16)) // TODO: wirkliche Länge "verify_data_length" herausfinden
};
exports.Finished = Finished;
//# sourceMappingURL=Handshake.js.map