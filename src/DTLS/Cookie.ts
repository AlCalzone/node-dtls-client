import * as TypeSpecs from "../TLS/TypeSpecs.js";

export namespace Cookie {

	export const spec = TypeSpecs.define.Buffer(0, 2 ** 8 - 1);

}
