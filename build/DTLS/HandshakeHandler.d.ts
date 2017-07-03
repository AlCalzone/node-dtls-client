import { RecordLayer } from "./RecordLayer";
import * as Handshake from "./Handshake";
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
    private finishedCallback;
    constructor(recordLayer: RecordLayer, finishedCallback: Function);
    private _state;
    readonly state: HandshakeStates;
    /**
     * (Re)negotiates a DTLS session. Is automatically called when the Handshake handler is created
     */
    renegotiate(): void;
    /** The last message seq number that has been processed already */
    private lastProcessedSeqNum;
    /** The seq number of the last sent message */
    private lastSentSeqNum;
    private incompleteMessages;
    private completeMessages;
    /** The currently expected flight, designated by the type of its last message */
    private expectedFlight;
    /**
     * Processes a received handshake message
     */
    processMessage(msg: Handshake.FragmentedHandshake): void;
    /**
     * Tries to assemble the fragmented messages in incompleteMessages
     */
    private tryAssembleFragments(reference);
    /**
     * reacts to a ChangeCipherSpec message
     */
    changeCipherSpec(): void;
    /**
     * handles server messages
     */
    private handle;
}
