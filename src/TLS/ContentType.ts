import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";

export enum ContentType {
	change_cipher_spec = 20,
	alert = 21,
	handshake = 22,
	application_data = 23,
}
export namespace ContentType {
	export const __spec = new TLSTypes.Enum("uint8", ContentType);
}
