import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { ContentType } from "../TLS/ContentType";

export interface DTLSPacket {

	type: ContentType;
	version: ProtocolVersion;
	epoch: number;
	sequence_number: number;
	fragment: Buffer;

}

