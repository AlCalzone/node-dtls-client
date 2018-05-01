import * as dgram from "dgram";
import { dtls } from "../dtls";
import { AntiReplayWindow } from "../TLS/AntiReplayWindow";
import { CompressionMethod, ConnectionState } from "../TLS/ConnectionState";
import { ContentType } from "../TLS/ContentType";
import { Message } from "../TLS/Message";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { TLSStruct } from "../TLS/TLSStruct";
import { DTLSCiphertext } from "./DTLSCiphertext";
import { CompressorDelegate, DecompressorDelegate, DTLSCompressed } from "./DTLSCompressed";
import { DTLSPlaintext } from "./DTLSPlaintext";

// enable debug output
import * as debugPackage from "debug";
const debug = debugPackage("node-dtls-client");

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
		const buf = this.processOutgoingMessage(msg);
		this.udpSocket.send(buf, 0, buf.length, this.options.port, this.options.address, callback);
	}
	/**
	 * Transforms the given message into a DTLSCiphertext packet,
	 * does neccessary processing and buffers it up for sending
	 */
	private processOutgoingMessage(msg: Message): Buffer {
		const epoch = this.epochs[this.writeEpochNr];

		let packet: DTLSPlaintext | DTLSCompressed | DTLSCiphertext = new DTLSPlaintext(
			msg.type,
			epoch.connectionState.protocolVersion || RecordLayer.DTLSVersion,
			this._writeEpochNr,
			++epoch.writeSequenceNumber, // sequence number increased by 1
			msg.data,
		);

		// compress packet
		const compressor: CompressorDelegate = (identity) => identity; // TODO: only valid for NULL compression, check it!
		packet = DTLSCompressed.compress(packet, compressor);

		if (epoch.connectionState.cipherSuite.cipherType != null) {
			// encrypt packet
			packet = epoch.connectionState.Cipher(packet as DTLSCompressed);
		}

		// get send buffer
		const ret = packet.serialize();

		// advance the write epoch, so we use the new params for sending the next messages
		if (msg.type === ContentType.change_cipher_spec) {
			this.advanceWriteEpoch();
		}

		return ret;

	}
	/**
	 * Sends all messages of a flight in one packet
	 * @param messages - The messages to be sent
	 */
	public sendFlight(messages: Message[], callback?: dtls.SendCallback) {
		const buf = Buffer.concat(
			messages.map(msg => this.processOutgoingMessage(msg)),
			);
		this.udpSocket.send(buf, 0, buf.length, this.options.port, this.options.address, callback);
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
				const packet = DTLSCiphertext.from(DTLSCiphertext.spec, buf, offset);
				if (packet.readBytes <= 0) {
					// this shouldn't happen, but we don't want to introduce an infinite loop
					throw new Error(`Zero or less bytes read while parsing DTLS packet.`);
				}
				packets.push(packet.result as DTLSCiphertext);
				offset += packet.readBytes;
			} catch (e) {
				// TODO: cancel connection or what?
				debug(`Error in RecordLayer.receive: ${e}`);
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
		const decompressor: DecompressorDelegate = (identity) => identity; // TODO: only valid for NULL compression, check it!

		packets = packets
			.map((p: DTLSCiphertext) => {
				const connectionState = this.epochs[p.epoch].connectionState;
				try {
					return connectionState.Decipher(p);
				} catch (e) {
					// decryption can fail because of bad MAC etc...
					// TODO: terminate connection if some threshold is passed (bad_record_mac)
					return null;
				}
			})
			.filter(p => p != null) // filter out packets that couldn't be decrypted
			.map(p => p.decompress(decompressor))
			;

		// update the anti replay window
		for (const p of packets) {
			this.epochs[p.epoch].antiReplayWindow.markAsReceived(p.sequence_number);
		}

		return packets.map(p => ({
			type: p.type,
			data: p.fragment,
		}));

	}

	/**
	 * All known connection epochs
	 */
	private epochs: Epoch[] = [];
	private _readEpochNr: number = 0;
	public get readEpochNr(): number { return this._readEpochNr; }
	/**
	 * The current epoch used for reading data
	 */
	public get currentReadEpoch(): Epoch { return this.epochs[this._readEpochNr]; }
	public get nextReadEpoch(): Epoch { return this.epochs[this._readEpochNr + 1]; }

	private _writeEpochNr: number = 0;
	public get writeEpochNr(): number { return this._writeEpochNr; }
	/**
	 * The current epoch used for writing data
	 */
	public get currentWriteEpoch(): Epoch { return this.epochs[this._writeEpochNr]; }
	public get nextWriteEpoch(): Epoch { return this.epochs[this._writeEpochNr + 1]; }

	public get nextEpochNr(): number {
		return Math.max(this.readEpochNr, this.writeEpochNr) + 1;
	}
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

	/**
	 * Maximum transfer unit of the underlying connection.
	 * Note: Ethernet supports up to 1500 bytes, of which 20 bytes are reserved for the IP header and 8 for the UDP header
	 */
	public static MTU: number = 1280;
	public static readonly MTU_OVERHEAD = 20 + 8;
	public static get MAX_PAYLOAD_SIZE() { return RecordLayer.MTU - RecordLayer.MTU_OVERHEAD; }

	// Default to DTLSv1.2
	public static DTLSVersion = new ProtocolVersion(~1, ~2);

}
