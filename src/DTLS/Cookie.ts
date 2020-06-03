import * as TypeSpecs from "../TLS/TypeSpecs";

export namespace Cookie {

	export const spec = TypeSpecs.define.Buffer(0, 2 ** 8 - 1);

}
