var dtls = require("../build/dtls").dtls;

const socket = dtls.createSocket({
	type: "udp4",
	address: "192.168.1.115",
	port: 5684,
	psk: { "Client_identity": "abcdefg" }
});