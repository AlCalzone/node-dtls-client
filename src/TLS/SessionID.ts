import { Vector } from "../TLS/Vector";
import { TLSStruct } from "./TLSStruct";
import * as TypeSpecs from "./TypeSpecs";

export namespace SessionID {

	export const spec = TypeSpecs.define.Buffer(0, 32);

}
