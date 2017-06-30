import { ConnectionEnd } from "../TLS/ConnectionState";
import { RecordLayer } from "./RecordLayer";
import { Handshake, FragmentedHandshake } from "./Handshake";
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

export class ClientHandshakeHandler {

	constructor(private recordLayer: RecordLayer, private finishedCallback: Function) {
		this._state = HandshakeStates.preparing;
	}

	private _state;
	public get state(): HandshakeStates {
		return this._state;
	}

	/**
	 * (Re)negotiates a DTLS session
	 */
	public renegotiate() {

	}

	/**
	 * Processes a received handshake message
	 */
	public processMessage(msg: FragmentedHandshake) {

	}
	/**
	 * reacts to a ChangeCipherSpec message
	 */
	public changeCipherSpec() {

	}
	

}