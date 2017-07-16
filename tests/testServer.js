const dgram = require("dgram");

// a real (working) handshake to test our implementation
const packets = {
	"client_hello": "16fefd000000000000000000380100002c000000000000002cfefd2dc3b6afc7ddaceac9a76d6e00b2c6ef8627e227aa9ddaac1ad812fba69064bc00000004c0a800ae0100",
	//               0011223344556677889900112233
	//                                         ^^
	"hello_verify_request": "16fefd0000000000000000002f030000230000000000000023fefd20b5a89525604b4e0e3bc0236e89b1b0431fe193533892976c154136fe2c266ec2",
	"client_hello2": "16fefd000000000000000100580100004c000100000000004cfefd2dc3b6afc7ddaceac9a76d6e00b2c6ef8627e227aa9ddaac1ad812fba69064bc0020b5a89525604b4e0e3bc0236e89b1b0431fe193533892976c154136fe2c266ec20004c0a800ae0100",
	//                0011223344556677889900112233
	//                                          ^^
	"server_hello": "16fefd00000000000000010032020000260001000000000026fefd59186ef2c947a95a7e7b0e8d91b78f0cff928533ae62036b249a1603a12d269d00c0a800",
	"server_hello_done": "16fefd0000000000000002000c0e0000000002000000000000",
	"client_key_exchange": "16fefd0000000000000002001d100000110002000000000011000f436c69656e745f6964656e74697479",
	//                      0011223344556677889900112233
	//                                                ^^
	"change_cipher_spec_client": "14fefd0000000000000003000101",
	//                            ^^
	"finished_client": "16fefd0001000000000000002800000000000000000120ad146c967fd34fd7f73606920296acd5d4e8cabc7739ef590f2bf07b7cfc",
	//                  0011223344556677889900
	//                        ^^^^^^^^^^^^^^^^
	"change_cipher_spec": "14fefd0000000000000003000101",
	"finished": "16fefd000100000000000000280001000000000000cce993ea1895d6bdd3b6121a1e0d9c41db61f0b4b3472229c704c80b3bfff378"
};

const udp = dgram
	.createSocket("udp4")
	.on("listening", udp_onListening)
	.on("message", udp_onMessage)
	;
udp.bind(5684);

function udp_onListening() {
	console.log("server running...");
}

let is2ndHello = false;
function udp_onMessage(msg, rinfo) {
	let packet;
	if (msg[0] === 0x16) {
		if (msg[13] === 1) { // client hello
			if (!is2ndHello) {
				packet = packets.client_hello;
				console.log("--------------------------------------");
				console.log("received client_hello (without cookie)");
				logCompare(packet, msg);
				send("hello_verify_request", rinfo);
				// wait for client_hello with cookie

				is2ndHello = true;
			} else {
				packet = packets.client_hello2;
				console.log("--------------------------------------");
				console.log("received client_hello (with cookie)");
				logCompare(packet, msg);
				send("server_hello", rinfo);
				send("server_hello_done", rinfo);
				// wait for client_key_exchange
			}


		} else if (msg[13] === 0x10) { // client_key_exchange
			packet = packets.client_key_exchange;
			console.log("--------------------------------------");
			console.log("received client_key_exchange");
			logCompare(packet, msg);
			// wait for change_cipher_spec

		} else if (msg.slice(3, 11).equals(Buffer.from("0001000000000000", "hex"))) { // finished_client
			packet = packets.finished_client;
			console.log("--------------------------------------");
			console.log("received finished");
			logCompare(packet, msg);

			send("change_cipher_spec", rinfo);
			send("finished", rinfo);

			console.log("");
			console.log("--------------------------------------");
			console.log("handshake complete");
			console.log("--------------------------------------");
		}
	} else if (msg[0] === 0x14) { // change_cipher_spec
		packet = packets.change_cipher_spec_client;
		console.log("--------------------------------------");
		console.log("received change_cipher_spec");
		logCompare(packet, msg);
		// wait for finished
	} 
}

function logCompare(packet, msg) {
	console.log("actual:");
	console.log(msg.toString("hex"));
	console.log("expected:");
	console.log(packet);
	console.log(msg.equals(Buffer.from(packet, "hex")) ? "MATCH" : "NO MATCH");
}

function send(packet, rinfo) {
	console.log("--------------------------------------");
	console.log(`sending ${packet}`);
	packet = packets[packet];
	console.log(packet);
	udp.send(Buffer.from(packet, "hex"), rinfo.port, rinfo.address);
}