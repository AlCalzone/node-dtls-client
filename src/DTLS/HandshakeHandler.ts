export class HandshakeHandler {

}



// TODO: This is something for a later version. For now implement handshakes without retransmission

//import { ConnectionEnd } from "../TLS/ConnectionState";
//
///**
// * DTLS Timeout and retransmission state machine for the handshake protocol
// * according to https://tools.ietf.org/html/rfc6347#section-4.2.4
// */
//
//export enum HandshakeStates {
//	preparing,
//	sending,
//	waiting,
//	finished
//}
//
//export class HandshakeHandler {
//
//	constructor(thisEntity: ConnectionEnd) {
//		if (thisEntity === "server") {
//			// servers start in waiting state
//			this._state = HandshakeStates.waiting;
//		} else {
//			// clients start in preparing state
//			this._state = HandshakeStates.preparing;
//		}
//	}
//
//	private _state;
//	public get state(): HandshakeStates {
//		return this._state;
//	}
//	
//
//}