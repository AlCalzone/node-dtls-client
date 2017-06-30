import { ConnectionEnd } from "../TLS/ConnectionState";
import { RecordLayer } from "./RecordLayer";
import * as Handshake from "./Handshake";
import { ChangeCipherSpec } from "../TLS/ChangeCipherSpec";
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

interface flightComponent {
	type: Handshake.HandshakeType;
	required: boolean;
}
type waitForFlightCallback = (flight: Handshake.Handshake[]) => void;

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
		this._state = HandshakeStates.preparing;
		this.lastProcessedSeqNum = -1;
		this.lastSentSeqNum = -1;
	}

	/** The last message seq number that has been processed already */
	private lastProcessedSeqNum: number;
	/** The seq number of the last sent message */
	private lastSentSeqNum: number;
	/** The collected handshake messages waiting for processing */
	private incompleteMessages: Handshake.FragmentedHandshake[];
	private completeMessages: Handshake.Handshake[];
	/** The list of functions waiting for new *complete* messages */
	private listeners: Function[];

	/**
	 * Processes a received handshake message
	 */
	public processMessage(msg: Handshake.FragmentedHandshake) {
		let callListeners: boolean;
		if (msg.isFragmented()) {
			// remember incomplete messages and try to assemble them afterwards
			this.incompleteMessages.push(msg);
			callListeners = this.tryToAssembleFragments(msg);
		} else {
			// the message is already complete, we only need to parse it
			this.completeMessages.push(Handshake.Handshake.parse(msg));
			callListeners = true;
		}
		// call all listeners
		if (callListeners) {
			this.listeners.forEach(fn => fn());
		}
	}
	/**
	 * Tries to assemble the fragmented messages in incompleteMessages
	 */
	private tryToAssembleFragments(reference: Handshake.FragmentedHandshake): boolean {
		// find all matching fragments
		const allFragments = Handshake.FragmentedHandshake.findAllFragments(
			this.incompleteMessages, reference
		);
		if (Handshake.FragmentedHandshake.isComplete(allFragments)) {
			// if we found all, reassemble them
			const reassembled = Handshake.FragmentedHandshake.reassemble(allFragments);
			// add the message to the list of complete ones
			this.completeMessages.push(Handshake.Handshake.parse(reassembled));
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

	/** 
	 * waits until a specific combination of messages arrives
	 * @param flight - the messages to be expected
	 * @param callback - the function to be called when the messages arrive
	 */
	private waitForFlight(flight: flightComponent[], callback: waitForFlightCallback) {
		// TODO: add listener
		// TODO: remove listener when successful or timeout
	}
	

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