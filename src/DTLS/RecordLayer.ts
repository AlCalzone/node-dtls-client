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

interface Epoch {
	index: number;
	connectionState: ConnectionState;
	writeSequenceNumber: number;
	antiReplayWindow: AntiReplayWindow;
}

export class RecordLayer {

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
		const epoch = this.epochs[this.writeEpoch];

		let packet: DTLSPlaintext | DTLSCompressed | DTLSCiphertext = new DTLSPlaintext(
			msg.type,
			new ProtocolVersion(~1, ~2), // 2's complement of 1.2
			this._writeEpoch,
			++epoch.writeSequenceNumber, // sequence number increased by 1
			msg.data
		);

		// compress packet
		const compressor = (identity) => identity; // TODO: implement compression algorithms
		packet = DTLSCompressed.compress(packet, compressor);

		// encrypt packet
		packet = DTLSCiphertext.encrypt(
			packet as DTLSCompressed, 
			epoch.connectionState.Cipher, 
			epoch.connectionState.OutgoingMac
			);

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
				let packet = TLSStruct.from(DTLSCiphertext.spec, buf, offset);
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
				} else if (p.epoch < this.readEpoch) {
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
					return p.decrypt(connectionState.Decipher, connectionState.IncomingMac);
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
	/**
	 * The current epoch used for reading data
	 */
	private _readEpoch: number = 0;
	public get readEpoch(): number { return this._readEpoch; }
	
	/**
	 * The current epoch used for writing data
	 */
	private _writeEpoch: number = 0;
	public get writeEpoch(): number { return this._writeEpoch; }

	/**
	 * The epoch that will be used next
	 */
	public get nextEpoch(): number {
		return Math.max(this.readEpoch, this.writeEpoch) + 1;
	};
	/**
	 * Ensure there's a next epoch to switch to
	 */
	private ensureNextEpoch() {
		// makes sure a pending state exists
		if (!this.epochs[this.nextEpoch]) {
			this.epochs[this.nextEpoch] = this.createEpoch(this.nextEpoch);
		}
	}
	private createEpoch(index: number): Epoch {
		return {
			index: index,
			connectionState: new ConnectionState(),
			antiReplayWindow: new AntiReplayWindow(),
			writeSequenceNumber: 0,
		};
	}

	public advanceReadEpoch(): void {
		this._readEpoch++;
		this.ensureNextEpoch();
	}
	public advanceWriteEpoch(): void {
		this._writeEpoch++;
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