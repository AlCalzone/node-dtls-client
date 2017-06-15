"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TLSTypes = require("../lib/TLSTypes");
var TLSStruct_1 = require("../lib/TLSStruct");
var object_polyfill_1 = require("../lib/object-polyfill");
var Random_1 = require("./Random");
var SessionID_1 = require("./SessionID");
var CipherSuite_1 = require("../record-layer/CipherSuite");
var CompressionMethod_1 = require("../record-layer/CompressionMethod");
var ProtocolVersion_1 = require("../record-layer/ProtocolVersion");
var Handshake = (function (_super) {
    __extends(Handshake, _super);
    function Handshake(msg_type, bodySpec, initial) {
        var _this = _super.call(this, object_polyfill_1.extend(Handshake.__spec, { body: bodySpec }), initial) || this;
        _this.msg_type = msg_type;
        return _this;
    }
    Object.defineProperty(Handshake.prototype, "length", {
        get: function () {
            // TODO: In TLSStruct einmalig definieren
            return this.getCalculatedPropertyValue("length");
        },
        enumerable: true,
        configurable: true
    });
    return Handshake;
}(TLSStruct_1.TLSStruct));
Handshake.__spec = {
    msg_type: new TLSTypes.Enum("uint8", HandshakeType),
    length: new TLSTypes.Calculated("uint24", "serializedLength", "body")
};
exports.Handshake = Handshake;
var HandshakeType;
(function (HandshakeType) {
    HandshakeType[HandshakeType["hello_request"] = 0] = "hello_request";
    HandshakeType[HandshakeType["client_hello"] = 1] = "client_hello";
    HandshakeType[HandshakeType["server_hello"] = 2] = "server_hello";
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
    function ClientHello(client_version, session_id, extensions) {
        var _this = _super.call(this, HandshakeType.client_hello, extensions != undefined ? ClientHello.__bodySpecWithExtensions : ClientHello.__bodySpec) || this;
        _this.client_version = client_version;
        _this.session_id = session_id;
        _this.extensions = extensions;
        return _this;
    }
    return ClientHello;
}(Handshake));
ClientHello.__bodySpec = {
    client_version: ProtocolVersion_1.ProtocolVersion.__spec,
    random: Random_1.Random.__spec,
    session_id: SessionID_1.SessionID.__spec,
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
    compression_method: CompressionMethod_1.CompressionMethod.__spec
};
ServerHello.__bodySpecWithExtensions = object_polyfill_1.extend(ServerHello.__bodySpec, {});
exports.ServerHello = ServerHello;
//# sourceMappingURL=Handshake.js.map