"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dtls_1 = require("../src/dtls");
var socket = dtls_1.dtls.createSocket({
    type: "udp4",
    address: "127.0.0.1",
    port: 1234,
    psk: { "Client_identity": "abcdefg" }
});
//# sourceMappingURL=debug.js.map