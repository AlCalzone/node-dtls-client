import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
import { Vector } from "../TLS/Vector";

export namespace SessionID {

	export const spec = TypeSpecs.define.Vector(TypeSpecs.uint8, 0, 32);

	export function create(items: number[] = []) {
		return new Vector<number>(spec, items);
	}

}