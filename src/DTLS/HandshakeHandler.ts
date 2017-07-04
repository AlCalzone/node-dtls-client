import { ConnectionEnd } from "../TLS/ConnectionState";
import { RecordLayer } from "./RecordLayer";
import * as Handshake from "./Handshake";
import { CipherSuite } from "../TLS/CipherSuite";
import { CipherSuites } from "../DTLS/CipherSuites";
import { ChangeCipherSpec } from "../TLS/ChangeCipherSpec";
import { Message } from "../TLS/Message";
import { ContentType } from "../TLS/ContentType";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { SessionID } from "../TLS/SessionID";
import { Random } from "../TLS/Random";
import { Cookie } from "../DTLS/Cookie";
import { Vector } from "../TLS/Vector";
import { CompressionMethod } from "../TLS/ConnectionState";
import { Extension } from "../TLS/Extension";


/**
* DTLS Timeout and retransmission state machine for the handshake protocol
* according to https://tools.ietf.org/html/rfc6347#section-4.2.4
*/

export enum HandshakeStates {
	preparing,
	sending,
	waiting,
	finished
}

//interface flightComponent {
//	type: Handshake.HandshakeType;
//	required: boolean;
//}
type FlightHandler = (flight: Handshake.Handshake[]) => void;

export class ClientHandshakeHandler {

	constructor(private recordLayer: RecordLayer, private finishedCallback: Function) {
		this.renegotiate();
	}

	private _state;
	public get state(): HandshakeStates {
		return this._state;
	}

	/**
	 * (Re)negotiates a DTLS session. Is automatically called when the Handshake handler is created
	 */
	public renegotiate() {
		// reset variables
		this._state = HandshakeStates.preparing;
		this.lastProcessedSeqNum = -1;
		this.lastSentSeqNum = -1;
		this.incompleteMessages = [];
		this.completeMessages = {};
		this.expectedResponses = [];
		this.cscReceived = false;
		this.serverFinishedPending = false;

		// ==============================
		// start by sending a ClientHello
		const hello = new Handshake.ClientHello();
		hello.client_version = new ProtocolVersion(~1, ~2);
		hello.random = Random.createNew();
		// remember this for crypto stuff
		this.recordLayer.nextEpoch.connectionState.client_random = hello.random.serialize();
		hello.session_id = SessionID.createNew();
		hello.cookie = Cookie.createNew();
		hello.cipher_suites = new Vector<number>(
			[
				// TODO: allow more
				CipherSuites.TLS_PSK_WITH_AES_128_CCM_8,
				CipherSuites.TLS_PSK_WITH_AES_128_CBC_SHA
			].map(cs => cs.id)
		);
		hello.compression_methods = new Vector<CompressionMethod>(
			[CompressionMethod.null]
		);
		hello.extensions = new Vector<Extension>();
		this.sendFlight(
			[hello],
			[
				Handshake.HandshakeType.server_hello_done,
				Handshake.HandshakeType.hello_verify_request
			]
		);
	}

	/** The last message seq number that has been processed already */
	private lastProcessedSeqNum: number;
	/** The seq number of the last sent message */
	private lastSentSeqNum: number;
	/** The previously sent flight */
	private lastFlight: Handshake.Handshake[];
	/* The collected handshake messages waiting for processing */
	private incompleteMessages: Handshake.FragmentedHandshake[];
	private completeMessages: { [index: number]: Handshake.Handshake };
	/** The currently expected flight, designated by the type of its last message */
	private expectedResponses: Handshake.HandshakeType[];

	// special cases for reordering of "Finished" flights
	// TODO: add these special cases to general handling functions
	private cscReceived: boolean;
	private serverFinishedPending: boolean;


	/**
	 * Processes a received handshake message
	 */
	public processMessage(msg: Handshake.FragmentedHandshake) {
		let checkFlight: boolean;
		if (msg.isFragmented()) {
			// remember incomplete messages and try to assemble them afterwards
			this.incompleteMessages.push(msg);
			checkFlight = this.tryAssembleFragments(msg);
		} else {
			// the message is already complete, we only need to parse it
			this.completeMessages[msg.message_seq] = Handshake.Handshake.parse(msg);
			checkFlight = true;
		}
		// check if the flight is the current one, and complete
		if (checkFlight) {
			const completeMsgIndizes = Object.keys(this.completeMessages).map(k => +k);
			// a flight is complete if it forms a non-interrupted sequence of seq-nums
			const isComplete = [this.lastProcessedSeqNum].concat(completeMsgIndizes).every(
				(val, i, arr) => (i === 0) || (val === arr[i - 1] + 1)
				);
			if (!isComplete) return;

			const lastMsg = this.completeMessages[Math.max(...completeMsgIndizes)];
			if (this.expectedResponses != null) {
				// if we expect a flight and this is the one, call the handler
				if (this.expectedResponses.indexOf(lastMsg.msg_type) > -1) {
					this.expectedResponses = null;
					// and remember the seq number
					this.lastProcessedSeqNum = lastMsg.message_seq;
					// call the handler and clear the buffer
					const messages = completeMsgIndizes.map(i => this.completeMessages[i]);
					this.completeMessages = {};
					this.handle[lastMsg.msg_type](messages);
					// TODO: clear a retransmission timer
				}
			} else {
				// if we don't expect a flight, maybe do something depending on the type of the message
				// TODO: react to server sending us rehandshake invites
			}
		}
	}
	/**
	 * Tries to assemble the fragmented messages in incompleteMessages
	 */
	private tryAssembleFragments(reference: Handshake.FragmentedHandshake): boolean {
		// find all matching fragments
		const allFragments = Handshake.FragmentedHandshake.findAllFragments(
			this.incompleteMessages, reference
		);
		if (Handshake.FragmentedHandshake.isComplete(allFragments)) {
			// if we found all, reassemble them
			const reassembled = Handshake.FragmentedHandshake.reassemble(allFragments);
			// add the message to the list of complete ones
			this.completeMessages[reassembled.message_seq] = Handshake.Handshake.parse(reassembled);
			// and remove the other ones from the list of incomplete ones
			this.incompleteMessages = this.incompleteMessages.filter(
				fragment => allFragments.indexOf(fragment) === -1
				);
			return true;
		}
		return false;
	}


	/**
	 * reacts to a ChangeCipherSpec message
	 */
	public changeCipherSpec() {
		// advance the read epoch, so we understand the next messages received
		this.recordLayer.advanceReadEpoch();
		// TODO: how do we handle retransmission here?
		// TODO: how do we handle reordering (i.e. Finished received before ChangeCipherSpec)?
	}

	/**
	 * Sends the given flight of messages and remembers it for potential retransmission
	 * @param flight The flight to be sent.
	 * @param expectedResponses The types of possible responses we are expecting.
	 * @param retransmit If the flight is retransmitted, i.e. no sequence numbers are increased
	 */
	private sendFlight(flight: Handshake.Handshake[], expectedResponses: Handshake.HandshakeType[], retransmit = false) {
		this.lastFlight = flight;
		this.expectedResponses = expectedResponses;
		flight.forEach(handshake => {
			if (handshake.msg_type === Handshake.HandshakeType.finished) {
				// before finished messages, ALWAYS send a ChangeCipherSpec
				this.sendChangeCipherSpecMessage();
				// TODO: how do we handle retransmission here?
			}

			if (!retransmit) {
				handshake.message_seq = ++this.lastSentSeqNum;
			}
			this.sendHandshakeMessage(handshake)
		});
	}

	/**
	 * Fragments a handshake message, serializes the fragements into single messages and sends them over the record layer.
	 * Don't call this directly, rather use *sendFlight*
	 * @param handshake - The handshake message to be sent
	 */
	private sendHandshakeMessage(handshake: Handshake.Handshake) {
		const messages = handshake
			.fragmentMessage()
			.map(fragment => ({
				type: ContentType.handshake,
				data: fragment.serialize()
			}))
			;
		this.recordLayer.sendAll(messages);
	}
	/**
	 * Sends a ChangeCipherSpec message
	 */
	private sendChangeCipherSpecMessage() {
		const message = {
			type: ContentType.change_cipher_spec,
			data: (ChangeCipherSpec.createEmpty()).serialize()
		};
		this.recordLayer.send(message);
		// advance the write epoch, so we use the new params for sending the next messages
		this.recordLayer.advanceWriteEpoch();
	}

	/**
	 * handles server messages
	 */
	private handle: { [type: number]: FlightHandler } = {

		/** Handles a HelloVerifyRequest message */
		[Handshake.HandshakeType.hello_verify_request]: (messages: Handshake.Handshake[]) => {
			// this flight should only contain a single message, 
			// but to be sure extract the last one
			const hvr = messages[messages.length-1] as Handshake.HelloVerifyRequest;
			// add the cookie to the client hello and send it again
			const hello = this.lastFlight[0] as Handshake.ClientHello;
			hello.cookie = hvr.cookie;
			// TODO: do something with session id?
			this.sendFlight(
				[hello],
				[Handshake.HandshakeType.server_hello_done]
			);
		},

		/** Handles a ServerHelloDone flight */
		[Handshake.HandshakeType.server_hello_done]: (messages: Handshake.Handshake[]) => {
			for (let msg of messages) {
				switch (msg.msg_type) {
					case Handshake.HandshakeType.server_hello:
						const hello = msg as Handshake.ServerHello;
						// remember the random value
						this.recordLayer.nextEpoch.connectionState.server_random = hello.random.serialize();
						// set the cipher suite and compression method to be used
						this.recordLayer.nextEpoch.connectionState.cipherSuite = CipherSuites[hello.cipher_suite];
						this.recordLayer.nextEpoch.connectionState.compression_algorithm = hello.compression_method;
						// TODO: parse/support extensions?
						// TODO: remember the session id?
						break;
					// TODO: support more messages (look up PSK spec)
					case Handshake.HandshakeType.server_hello_done:
						// its our turn
						// TODO: what to send? client_key_exchange?
				}
			}
		},

	};
		

}

/* Client                                          Server
   ------                                          ------

   ClientHello             -------->                           Flight 1

						   <-------    HelloVerifyRequest      Flight 2

   ClientHello             -------->                           Flight 3

											  ServerHello    \
											 Certificate*     \
									   ServerKeyExchange*      Flight 4
									  CertificateRequest*     /
						   <--------      ServerHelloDone    /

   Certificate*                                              \
   ClientKeyExchange                                          \
   CertificateVerify*                                          Flight 5
   [ChangeCipherSpec]                                         /
   Finished                -------->                         /

									   [ChangeCipherSpec]    \ Flight 6
						   <--------             Finished    /

			   Figure 1. Message Flights for Full Handshake

=======================================================================

   Client                                           Server
   ------                                           ------

   ClientHello             -------->                          Flight 1

											  ServerHello    \
									   [ChangeCipherSpec]     Flight 2
							<--------             Finished    /

   [ChangeCipherSpec]                                         \Flight 3
   Finished                 -------->                         /

		 Figure 2. Message Flights for Session-Resuming Handshake
						   (No Cookie Exchange)
*/