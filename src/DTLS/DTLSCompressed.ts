import * as TLSTypes from "../TLS/TLSTypes";
import { TLSStruct } from "../TLS/TLSStruct";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { ContentType } from "../TLS/ContentType";
import { CompressionMethod } from "../TLS/ConnectionState"

export class DTLSCompressed extends TLSStruct {

	static readonly __spec = {
		type: ContentType.__spec,
		version: ProtocolVersion.__spec,
		epoch: "uint16",
		sequence_number: "uint48",
		length: new TLSTypes.Calculated("uint16", "serializedLength", "fragment"),
		fragment: new TLSTypes.Vector("uint8", 0, 1024 + 2 ** 14)
	};

	constructor(
		public type: ContentType,
		public version = new ProtocolVersion(),
		public epoch: number,
		public sequence_number: number,
		public fragment: Buffer
	) {
		super(DTLSCompressed.__spec);
	}

	/**
	 * Compresses the given plaintext packet
	 * @param packet - The plaintext packet to be compressed
	 * @param compressor - The compressor function used to compress the given packet
	 */
	static compress(packet: DTLSPlaintext, compressor: CompressorDelegate) : DTLSCompressed {
		return new DTLSCompressed(
			packet.type,
			packet.version,
			packet.epoch,
			packet.sequence_number,
			compressor(packet.fragment)
		);
	}
	
	/**
	 * Decompresses this packet into a plaintext packet
	 * @param decompressor - The decompressor function used to decompress this packet
	 */
	decompress(decompressor: DecompressorDelegate) : DTLSPlaintext {
		return new DTLSPlaintext(
			this.type,
			this.version,
			this.epoch,
			this.sequence_number,
			decompressor(this.fragment) // TODO: handle decompression errors (like too large fragments)
		);
	}

}

export type CompressorDelegate = (plaintext: Buffer) => Buffer;
export type DecompressorDelegate = (compressed: Buffer) => Buffer;