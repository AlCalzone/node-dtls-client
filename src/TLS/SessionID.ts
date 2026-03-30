import * as TypeSpecs from "./TypeSpecs.js";

export namespace SessionID {

	export const spec = TypeSpecs.define.Buffer(0, 32);

}
