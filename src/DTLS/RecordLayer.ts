import * as dgram from "dgram";
import { dtls } from "../dtls";
import { ConnectionState, CompressionMethod } from "../TLS/ConnectionState";
import { Message } from "../TLS/Message";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { DTLSPlaintext } from "./DTLSPlaintext";
import { DTLSCompressed } from "./DTLSCompressed";
import { DTLSCiphertext } from "./DTLSCiphertext";

export class RecordLayer {

	constructor(private udpSocket: dgram.Socket, private options: dtls.Options) {
		// initialize with NULL cipherspec
		// current state
		this.connectionStates[0] = new ConnectionState();
		// pending state
		this.ensurePendingState();
	}

	public send(msg: Message, callback?: dtls.SendCallback) {
		const currentWriteState = this.connectionStates[this.writeEpoch];

		let packet: DTLSPlaintext | DTLSCompressed | DTLSCiphertext = new DTLSPlaintext(
			msg.type,
			new ProtocolVersion(~1, ~2), // 2's complement of 1.2
			this._writeEpoch,
			++this._writeSequenceNumber, // sequence number increased by 1
			msg.data
		);

		// compress packet
		const compressor = (identity) => identity; // TODO: implement compression algorithms
		packet = DTLSCompressed.compress(packet, compressor);

		// encrypt packet
		packet = DTLSCiphertext.encrypt(packet as DTLSCompressed, currentWriteState.Cipher, currentWriteState.OutgoingMac);

		// get send buffer
		const buf = packet.serialize();
		// and send it
		this.udpSocket.send(buf, this.options.port, this.options.address, callback);
	}

	/**
	 * Connection states ordered by epochs
	 */
	private connectionStates: ConnectionState[/* epoch */] = [];
	/**
	 * The current epoch used for reading data
	 */
	private _readEpoch: number = 0;
	public get readEpoch(): number { return this._readEpoch; }
	// TODO: use anti replay window
	/**
	 * The current epoch used for writing data
	 */
	private _writeEpoch: number = 0;
	public get writeEpoch(): number { return this._writeEpoch; }
	private _writeSequenceNumber: number = 0;
	public get writeSequenceNumber(): number { return this._writeSequenceNumber };

	public advanceReadEpoch(): void {
		this._readEpoch++;
		this.ensurePendingState();
	}
	public advanceWriteEpoch(): void {
		this._writeEpoch++;
		this._writeSequenceNumber = 0;
		this.ensurePendingState();
	}
	private ensurePendingState() {
		// makes sure a pending state exists
		if (!this.connectionStates[this.nextEpoch])
			this.connectionStates[this.nextEpoch] = new ConnectionState();
	}
	public get nextEpoch(): number {
		return Math.max(this.readEpoch, this.writeEpoch) + 1;
	};


	// TODO: mal sehen, ob das nicht woanders besser aufgehoben ist
	
	/**
	 * Maximum transfer unit of the underlying connection.
	 * Note: Ethernet supports up to 1500 bytes, of which 20 bytes are reserved for the IP header and 8 for the UDP header
	 */
	public MTU: number = 1280;
	public readonly MTU_OVERHEAD = 20+8;
	public get MAX_PAYLOAD_SIZE() { return this.MTU - this.MTU_OVERHEAD;}

	public static IMPLEMENTED_PROTOCOL_VERSION =
}