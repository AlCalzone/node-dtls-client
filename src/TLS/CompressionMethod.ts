import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";

export enum CompressionMethod {
	none = 0
}
export namespace CompressionMethod {
	export const __spec = new TLSTypes.Enum("uint8", CompressionMethod);
}
