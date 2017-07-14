//const PRF = require("../build/TLS/PRF").PRF;
//const PreMasterSecret = require("../build/TLS/PreMasterSecret").PreMasterSecret;

var dtls = require("../build/dtls").dtls;

const socket = dtls.createSocket({
	type: "udp4",
	address: "127.0.0.1", //"127.0.0.1", //192.168.1.115
	port: 5684,
	psk: { "Client_identity": "X9LStOPeYT3UZu5w" } // 58394c53744f5065595433555a753577
});

// openssl s_server -psk 58394c53744f5065595433555a753577 -dtls1_2 -accept 10.10.10.10:5684 -debug -msg -state -msgfile D:\msgfile.log -cipher PSK-AES128-CCM8 -nocert
// openssl s_client -connect 127.0.0.1:5684 -psk_identity Client_identity -psk 58394c53744f5065595433555a753577 -dtls1_2 -cipher PSK-AES128-CCM8

// client random: 1c7812fd662b9e9fac3b25d51bbc23c02196fb6e2651751bfcd9be0059d539d2
// server random: 59691671c4c10e2a6776242fe23eba0fd75fc4cf0d326f8221bc39fe655a0a4d
// MASTER SECRET
// A76985547CE7205FFF9A3C27EA2CC69AACA4E28FF5F3F78CC2034D91A5C8054E9EDD9BC2925DE274CEDFFB2BCB04F938

//const psk = Buffer.from("X9LStOPeYT3UZu5w", "ascii");
//const preMasterSecret = new PreMasterSecret(null, psk);
//const client_random = Buffer.from("1c7812fd662b9e9fac3b25d51bbc23c02196fb6e2651751bfcd9be0059d539d2", "hex");
//const server_random = Buffer.from("59691671c4c10e2a6776242fe23eba0fd75fc4cf0d326f8221bc39fe655a0a4d", "hex");
//const master_secret = PRF["sha256"](
//	preMasterSecret.serialize(),
//	"master secret",
//	Buffer.concat([client_random, server_random]),
//	48
//);
//const blub = master_secret.toString("hex");
//console.log(blub);