import { ConnectionEnd } from "../TLS/ConnectionState";

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

	constructor() {
        this._state = HandshakeStates.preparing;
	}

	private _state;
	public get state(): HandshakeStates {
		return this._state;
	}
	

}