import * as dgram from "dgram";
import { dtls } from "../dtls";
import { ConnectionState, CompressionMethod } from "../TLS/ConnectionState";
import { Message } from "../TLS/Message";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { TLSStruct } from "../TLS/TLSStruct";
import { DTLSPlaintext } from "./DTLSPlaintext";
import { DTLSCompressed } from "./DTLSCompressed";
import { DTLSCiphertext } from "./DTLSCiphertext";
import { AntiReplayWindow } from "../TLS/AntiReplayWindow";

export interface Epoch {
	index: number;
	connectionState: ConnectionState;
	writeSequenceNumber: number;
	antiReplayWindow: AntiReplayWindow;
}

export class RecordLayer {

	// TODO: specify connection end
	constructor(private udpSocket: dgram.Socket, private options: dtls.Options) {
		// initialize with NULL cipherspec
		// current state
		this.epochs[0] = this.createEpoch(0);
		// pending state
		this.epochs[1] = this.createEpoch(1);
	}

	/**
	 * Transforms the given message into a DTLSCiphertext packet and sends it via UDP
	 * @param msg - The message to be sent
	 * @param callback - The function to be called after sending the message.
	 */
	public send(msg: Message, callback?: dtls.SendCallback) {
		const epoch = this.epochs[this.writeEpochNr];

		let packet: DTLSPlaintext | DTLSCompressed | DTLSCiphertext = new DTLSPlaintext(
			msg.type,
			new ProtocolVersion(~1, ~2), // 2's complement of 1.2
			this._writeEpochNr,
			++epoch.writeSequenceNumber, // sequence number increased by 1
			msg.data
		);

		// compress packet
		const compressor = (identity) => identity; // TODO: implement compression algorithms
		packet = DTLSCompressed.compress(packet, compressor);

		if (epoch.connectionState.cipherSuite.cipherType != null) {
			// encrypt packet
			packet = epoch.connectionState.Cipher(packet as DTLSCompressed);
			// packet = DTLSCiphertext.encrypt(
			// 	packet as DTLSCompressed,
			// 	epoch.connectionState.Cipher /*,
			// 	epoch.connectionState.OutgoingMac*/
			// );
		}

		// get send buffer
		const buf = packet.serialize();
		// TODO: check if the buffer satisfies the configured MTU
		// and send it
		this.udpSocket.send(buf, this.options.port, this.options.address, callback);
	}
	/**
	 * Sends all given messages
	 * @param messages - The messages to be sent
	 */
	public sendAll(messages: Message[]) {
		// TODO: enable send callbacks for bulk sending
		messages.forEach(msg => this.send(msg));
	}

	/**
	 * Receives DTLS messages from the given buffer.
	 * @param buf The buffer containing DTLSCiphertext packets
	 */
	public receive(buf: Buffer): Message[] {
		let offset = 0;
		let packets: (DTLSCiphertext | DTLSCompressed | DTLSPlaintext)[] = [];
		while (offset < buf.length) {
			try {
				let packet = DTLSCiphertext.from(DTLSCiphertext.spec, buf, offset);
				packets.push(packet.result as DTLSCiphertext);
				offset += packet.readBytes;
			} catch (e) {
				// TODO: cancel connection or what?
				break;
			}
		}

		// now filter packets
		const knownEpochs = Object.keys(this.epochs).map(k => +k);
		packets = packets
			.filter(p => {
				if (!(p.epoch in knownEpochs)) {
					// discard packets from an unknown epoch
					// this will keep packets from the upcoming one
					return false;
				} else if (p.epoch < this.readEpochNr) {
					// discard old packets
					return false;
				} 

				// discard packets that are not supposed to be received
				if (!this.epochs[p.epoch].antiReplayWindow.mayReceive(p.sequence_number)) {
					return false;
				}

				// parse the packet
				return true;
			});

		// decompress and decrypt packets
		const decompressor = (identity) => identity; // TODO implement actual compression methods

		packets = packets
			.map((p: DTLSCiphertext) => {
				const connectionState = this.epochs[p.epoch].connectionState;
				try {
					return connectionState.Decipher(p);
					//return p.decrypt(connectionState.Decipher/*, connectionState.IncomingMac*/);
				} catch (e) {
					// decryption can fail because of bad MAC etc...
					// TODO: terminate connection if some threshold is passed (bad_record_mac)
					return null;
				}
			})
			.filter(p => p != null) // filter out packets that couldn't be decrypted
			.map(p => p.decompress(decompressor))
		;

		return packets.map(p => ({
			type: p.type,
			data: p.fragment
		}));
		
	}

	/**
	 * All known connection epochs
	 */
	private epochs: Epoch[] = [];
	//private connectionStates: ConnectionState[/* epoch */] = [];
	private _readEpochNr: number = 0;
	public get readEpochNr(): number { return this._readEpochNr; }
	/**
	 * The current epoch used for reading data
	 */
	public get currentReadEpoch(): Epoch { return this.epochs[this._readEpochNr]; }
	public get nextReadEpoch(): Epoch { return this.epochs[this._readEpochNr+1]; }
	
	private _writeEpochNr: number = 0;
	public get writeEpochNr(): number { return this._writeEpochNr; }
	/**
	 * The current epoch used for writing data
	 */
	public get currentWriteEpoch(): Epoch { return this.epochs[this._writeEpochNr]; }
	public get nextWriteEpoch(): Epoch { return this.epochs[this._writeEpochNr+1]; }

	public get nextEpochNr(): number {
		return Math.max(this.readEpochNr, this.writeEpochNr) + 1;
	};
	/**
	 * The next read and write epoch that will be used. 
	 * Be careful as this might point to the wrong epoch between ChangeCipherSpec messages
	 */
	public get nextEpoch(): Epoch { return this.epochs[this.nextEpochNr]; }

	/**
	 * Ensure there's a next epoch to switch to
	 */
	private ensureNextEpoch() {
		// makes sure a pending state exists
		if (!this.epochs[this.nextEpochNr]) {
			this.epochs[this.nextEpochNr] = this.createEpoch(this.nextEpochNr);
		}
	}
	private createEpoch(index: number): Epoch {
		return {
			index: index,
			connectionState: new ConnectionState(),
			antiReplayWindow: new AntiReplayWindow(),
			writeSequenceNumber: -1,
		};
	}

	public advanceReadEpoch(): void {
		this._readEpochNr++;
		this.ensureNextEpoch();
	}
	public advanceWriteEpoch(): void {
		this._writeEpochNr++;
		this.ensureNextEpoch();
	}


	// TODO: mal sehen, ob das nicht woanders besser aufgehoben ist
	
	/**
	 * Maximum transfer unit of the underlying connection.
	 * Note: Ethernet supports up to 1500 bytes, of which 20 bytes are reserved for the IP header and 8 for the UDP header
	 */
	public static MTU: number = 1280;
	public static readonly MTU_OVERHEAD = 20+8;
	public static get MAX_PAYLOAD_SIZE() { return RecordLayer.MTU - RecordLayer.MTU_OVERHEAD };

}