import * as TypeSpecs from "../TLS/TypeSpecs";
import { TLSStruct } from "../TLS/TLSStruct";
import { Vector } from "../TLS/Vector";

export namespace Cookie {

	export const spec = TypeSpecs.define.Vector(TypeSpecs.uint8, 0, 2 ** 8 - 1);

	export function createNew(items: number[] = []) {
		return new Vector<number>(items);
	}

}