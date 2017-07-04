import { dtls } from "../dtls";
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
    private options;
    private finishedCallback;
    constructor(recordLayer: RecordLayer, options: dtls.Options, finishedCallback: Function);
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
    /** The previously sent flight */
    private lastFlight;
    private incompleteMessages;
    private completeMessages;
    /** The currently expected flight, designated by the type of its last message */
    private expectedResponses;
    /** All handshake data sent so far, buffered for the Finished -> verify_data */
    private allHandshakeData;
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
     * Sends the given flight of messages and remembers it for potential retransmission
     * @param flight The flight to be sent.
     * @param expectedResponses The types of possible responses we are expecting.
     * @param retransmit If the flight is retransmitted, i.e. no sequence numbers are increased
     */
    private sendFlight(flight, expectedResponses, retransmit?);
    /**
     * Fragments a handshake message, serializes the fragements into single messages and sends them over the record layer.
     * Don't call this directly, rather use *sendFlight*
     * @param handshake - The handshake message to be sent
     */
    private sendHandshakeMessage(handshake, retransmit);
    /**
     * remembers the raw data of handshake messages for verification purposes
     * @param messages - the messages to be remembered
     */
    private bufferHandshakeData(...messages);
    /**
     * computes the verify data for a Finished message
     * @param handshakeMessages - the concatenated messages received so far
     */
    private computeVerifyData(handshakeMessages, source);
    /**
     * Sends a ChangeCipherSpec message
     */
    private sendChangeCipherSpecMessage();
    /**
     * handles server messages
     */
    private handle;
}
