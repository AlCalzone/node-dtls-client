import { RecordLayer } from "./RecordLayer";
import { FragmentedHandshake } from "./Handshake";
/**
* DTLS Timeout and retransmission state machine for the handshake protocol
* according to https://tools.ietf.org/html/rfc6347#section-4.2.4
*/
export declare enum HandshakeStates {
    preparing = 0,
    sending = 1,
    waiting = 2,
    finished = 3,
}
export declare class ClientHandshakeHandler {
    private recordLayer;
    constructor(recordLayer: RecordLayer);
    private _state;
    readonly state: HandshakeStates;
    /**
     * (Re)negotiates a DTLS session
     */
    renegotiate(): void;
    /**
     * Processes a received handshake message
     */
    processMessage(msg: FragmentedHandshake): void;
    /**
     * reacts to a ChangeCipherSpec message
     */
    changeCipherSpec(): void;
}
