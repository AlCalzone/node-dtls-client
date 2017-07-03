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

		// start by sending a ClientHello
		const hello = new Handshake.ClientHello();
		hello.message_seq = ++this.lastSentSeqNum;
		hello.client_version = new ProtocolVersion(~1, ~2);
		hello.random = Random.createNew();
		hello.session_id = SessionID.create();
		hello.cookie = Cookie.create();
		hello.cipher_suites = new Vector<CipherSuite>(
			Handshake.ClientHello.__spec.cipher_suites,
			[
				// TODO: allow more
				CipherSuites.TLS_PSK_WITH_AES_128_CCM_8,
				CipherSuites.TLS_PSK_WITH_AES_128_CBC_SHA
			]
		);
		hello.compression_methods = new Vector<CompressionMethod>(
			Handshake.ClientHello.__spec.compression_methods,
			[CompressionMethod.null]
		);
		hello.extensions = new Vector<Extension>(
			Handshake.ClientHello.__spec.extensions
		);
		this.sendFlight(
			[hello],
			[
				Handshake.HandshakeType.server_hello,
				Handshake.HandshakeType.hello_verify_request
			]
		);
	}

	/** The last message seq number that has been processed already */
	private lastProcessedSeqNum: number;
	/** The seq number of the last sent message */
	private lastSentSeqNum: number;
	/* The collected handshake messages waiting for processing */
	private incompleteMessages: Handshake.FragmentedHandshake[];
	private completeMessages: { [index: number]: Handshake.Handshake };
	/** The currently expected flight, designated by the type of its last message */
	private expectedResponses: Handshake.HandshakeType[];


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

	}

	private sendFlight(flight: Handshake.Handshake[], expectedResponses: Handshake.HandshakeType[]) {
		// TODO: buffer the flight for retransmission
		this.expectedResponses = expectedResponses;
		flight.forEach(handshake => this.sendHandshakeMessage(handshake));
	}

	/**
	 * Fragments a handshake message, serializes the fragements into single messages and sends them over the record layer
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
	 * handles server messages
	 */
	private handle: { [type: number]: FlightHandler } = {

		/** Handles a HelloVerifyRequest message */
		[Handshake.HandshakeType.hello_verify_request]: (messages) => {

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