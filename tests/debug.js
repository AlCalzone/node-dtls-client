var dtls = require("../build/dtls").dtls;

const socket = dtls.createSocket({
	type: "udp4",
	address: "127.0.0.1",
	port: 1234,
	psk: { "Client_identity": "abcdefg" }
});