const PRF = require("../build/TLS/PRF").PRF;
const PreMasterSecret = require("../build/TLS/PreMasterSecret").PreMasterSecret;

var dtls = require("../").dtls;

const socket = dtls.createSocket({
	type: "udp4",
	address: "192.168.1.115", //192.168.1.115 // 127.0.0.1
	port: 5684,
	psk: { "Client_identity": "X9LStOPeYT3UZu5w" } // 58394c53744f5065595433555a753577
})
	.on("connected", () => {
		console.log("secure connection established");
		socket.send(Buffer.from("01020304", "hex"));
	})
	.on("error", (e) => console.error(`error: ${e.message}`))
	.on("message", (msg) => console.log(`received message: ${msg}`))
	.on("close", () => console.log("connection closed"))
	;

/*
openssl s_server -psk 58394c53744f5065595433555a753577 -dtls1_2 -accept 127.0.0.1:5684 -debug -msg -state -cipher PSK-AES128-CCM8 -nocert -no_ticket
openssl s_server -psk 58394c53744f5065595433555a753577 -dtls1_2 -accept 127.0.0.1:5684 -debug -msg -state -cipher PSK-AES128-CBC-SHA256 -nocert -no_ticket
openssl s_client -connect 127.0.0.1:5684 -psk_identity Client_identity -psk 58394c53744f5065595433555a753577 -dtls1_2 -cipher PSK-AES128-CCM8

client random: 1c7812fd662b9e9fac3b25d51bbc23c02196fb6e2651751bfcd9be0059d539d2
server random: 59691671c4c10e2a6776242fe23eba0fd75fc4cf0d326f8221bc39fe655a0a4d
MASTER SECRET
A76985547CE7205FFF9A3C27EA2CC69AACA4E28FF5F3F78CC2034D91A5C8054E9EDD9BC2925DE274CEDFFB2BCB04F938
*/

/*
handshake data: 0100004c000100000000004cfefd2dc3b6afc7ddaceac9a76d6e00b2c6ef8627e227aa9ddaac1ad812fba69064bc0020b5a89525604b4e0e3bc0236e89b1b0431fe193533892976c154136fe2c266ec20004c0a800ae0100020000260001000000000026fefd59186ef2c947a95a7e7b0e8d91b78f0cff928533ae62036b249a1603a12d269d00c0a8000e0000000002000000000000100000110002000000000011000f436c69656e745f6964656e74697479
actual:         0100004c000100000000004cfefd2dc3b6afc7ddaceac9a76d6e00b2c6ef8627e227aa9ddaac1ad812fba69064bc0020b5a89525604b4e0e3bc0236e89b1b0431fe193533892976c154136fe2c266ec20004c0a800ae0100020000260001000000000026fefd59186ef2c947a95a7e7b0e8d91b78f0cff928533ae62036b249a1603a12d269d00c0a8000e0000000002000000000000100000110000000000000011000f436c69656e745f6964656e74697479
verify data: 3cae2c620a2b4357b32ed1c4
actual     : d53613f7ef44a3c9da30f752
*/

//const PRF = require("../build/TLS/PRF").PRF;
//const CipherSuites = require("../build/DTLS/CipherSuites").CipherSuites;
//const CipherSuite = require("../build/TLS/CipherSuite").CipherSuite;
//const PreMasterSecret = require("../build/TLS/PreMasterSecret").PreMasterSecret;

//// a real (working) handshake to test our implementation
//const packets = {
//	"client_hello": "16fefd000000000000000000380100002c000000000000002cfefd2dc3b6afc7ddaceac9a76d6e00b2c6ef8627e227aa9ddaac1ad812fba69064bc00000004c0a800ae0100",
//	"hello_verify_request": "16fefd0000000000000000002f030000230000000000000023fefd20b5a89525604b4e0e3bc0236e89b1b0431fe193533892976c154136fe2c266ec2",
//	"client_hello2": "16fefd000000000000000100580100004c000100000000004cfefd2dc3b6afc7ddaceac9a76d6e00b2c6ef8627e227aa9ddaac1ad812fba69064bc0020b5a89525604b4e0e3bc0236e89b1b0431fe193533892976c154136fe2c266ec20004c0a800ae0100",
//	"server_hello": "16fefd00000000000000010032020000260001000000000026fefd59186ef2c947a95a7e7b0e8d91b78f0cff928533ae62036b249a1603a12d269d00c0a800",
//	"server_hello_done": "16fefd0000000000000002000c0e0000000002000000000000",
//	"client_key_exchange": "16fefd0000000000000002001d100000110002000000000011000f436c69656e745f6964656e74697479",
//	"change_cipher_spec_client": "14fefd0000000000000003000101",
//	"finished_client": "16fefd0001000000000000002800000000000000000120ad146c967fd34fd7f73606920296acd5d4e8cabc7739ef590f2bf07b7cfc",
//	"finished_client_plaintext": "1400000c000300000000000c3cae2c620a2b4357b32ed1c4",
//	"change_cipher_spec": "14fefd0000000000000003000101",
//	"finished": "16fefd000100000000000000280001000000000000cce993ea1895d6bdd3b6121a1e0d9c41db61f0b4b3472229c704c80b3bfff378",
//};
//const cipherSuite = CipherSuites.TLS_PSK_WITH_AES_128_CCM_8;
//const client_random = Buffer.from("2dc3b6afc7ddaceac9a76d6e00b2c6ef8627e227aa9ddaac1ad812fba69064bc", "hex");
//const server_random = Buffer.from("59186ef2c947a95a7e7b0e8d91b78f0cff928533ae62036b249a1603a12d269d", "hex");
//const psk = Buffer.from("58394c53744f5065595433555a753577", "hex");
//const master_secret_length = 48;
//const client_random_length = 32;
//const server_random_length = 32;
//let master_secret, key_material;

//const preMasterSecret = new PreMasterSecret(null, psk);
//computeMasterSecret(preMasterSecret);

//function computeMasterSecret(preMasterSecret) {
//	master_secret = PRF[cipherSuite.prfAlgorithm](
//		preMasterSecret.serialize(),
//		"master secret",
//		Buffer.concat([client_random, server_random]),
//		master_secret_length
//	);

//	// now we can compute the key material
//	computeKeyMaterial();
//}

///**
// * Berechnet die Schlüsselkomponenten
// */
//function computeKeyMaterial() {
//	const keyBlock = PRF[cipherSuite.prfAlgorithm](
//		master_secret,
//		"key expansion",
//		Buffer.concat([server_random, client_random]),
//		2 * (cipherSuite.MAC.keyAndHashLength + cipherSuite.Cipher.keyLength + cipherSuite.Cipher.fixedIvLength)
//	);

//	let offset = 0;
//	function read(length) {
//		const ret = keyBlock.slice(offset, offset + length);
//		offset += length;
//		return ret;
//	}

//	key_material = {
//		client_write_MAC_key: read(cipherSuite.MAC.keyAndHashLength),
//		server_write_MAC_key: read(cipherSuite.MAC.keyAndHashLength),
//		client_write_key: read(cipherSuite.Cipher.keyLength),
//		server_write_key: read(cipherSuite.Cipher.keyLength),
//		client_write_IV: read(cipherSuite.Cipher.fixedIvLength),
//		server_write_IV: read(cipherSuite.Cipher.fixedIvLength)
//	};
		
//}

//let handshakeMessages = "";
//handshakeMessages += packets.client_hello2.substr(2*13);
//handshakeMessages += packets.server_hello.substr(2*13);
//handshakeMessages += packets.server_hello_done.substr(2*13);
//handshakeMessages += packets.client_key_exchange.substr(2*13);
//console.log(`handshake messages: ${handshakeMessages}`);

//const PRF_fn = PRF[cipherSuite.prfAlgorithm];
//let handshakeHash = PRF_fn.hashFunction(Buffer.from(handshakeMessages, "hex"));
//// and use it to compute the verify data
//let verify_data = PRF_fn(master_secret, `client finished`, handshakeHash, cipherSuite.verify_data_length);
//console.log(`verify data: ${verify_data.toString("hex")}`);
//console.log("");

//handshakeMessages += packets.finished_client_plaintext;
//console.log(`handshake messages: ${handshakeMessages}`);
//handshakeHash = PRF_fn.hashFunction(Buffer.from(handshakeMessages, "hex"));
//verify_data = PRF_fn(master_secret, `server finished`, handshakeHash, cipherSuite.verify_data_length);
//console.log(`verify data: ${verify_data.toString("hex")}`);


//20e2fad47444e47746b340a1

// actual:   0100004c000100000000004cfefd2dc3b6afc7ddaceac9a76d6e00b2c6ef8627e227aa9ddaac1ad812fba69064bc0020b5a89525604b4e0e3bc0236e89b1b0431fe193533892976c154136fe2c266ec20004c0a800ae0100020000260001000000000026fefd59186ef2c947a95a7e7b0e8d91b78f0cff928533ae62036b249a1603a12d269d00c0a8000e0000000002000000000000100000110002000000000011000f436c69656e745f6964656e746974791400000c000300000000000c3cae2c620a2b4357b32ed1c41400000c000300000000000c20e2fad47444e47746b340a1
// expected: 0100004c000100000000004cfefd2dc3b6afc7ddaceac9a76d6e00b2c6ef8627e227aa9ddaac1ad812fba69064bc0020b5a89525604b4e0e3bc0236e89b1b0431fe193533892976c154136fe2c266ec20004c0a800ae0100020000260001000000000026fefd59186ef2c947a95a7e7b0e8d91b78f0cff928533ae62036b249a1603a12d269d00c0a8000e0000000002000000000000100000110002000000000011000f436c69656e745f6964656e746974791400000c000300000000000c3cae2c620a2b4357b32ed1c4