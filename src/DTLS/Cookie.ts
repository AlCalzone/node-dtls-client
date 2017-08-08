import { TLSStruct } from "../TLS/TLSStruct";
import * as TypeSpecs from "../TLS/TypeSpecs";
import { Vector } from "../TLS/Vector";

export namespace Cookie {

	export const spec = TypeSpecs.define.Buffer(0, 2 ** 8 - 1);

}
