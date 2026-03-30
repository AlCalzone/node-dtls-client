import { ContentType } from "../TLS/ContentType.js";
import { ProtocolVersion } from "../TLS/ProtocolVersion.js";

export interface DTLSPacket {

	type: ContentType;
	version: ProtocolVersion;
	epoch: number;
	sequence_number: number;
	fragment: Buffer;

}
