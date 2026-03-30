import { ContentType } from "./ContentType.js";

export interface Message {
	type: ContentType;
	data: Buffer;
}
