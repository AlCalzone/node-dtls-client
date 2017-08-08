import { ContentType } from "./ContentType";

export interface Message {
	type: ContentType;
	data: Buffer;
}
