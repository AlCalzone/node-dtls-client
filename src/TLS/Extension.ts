import { TLSStruct } from "./TLSStruct";
import * as TypeSpecs from "./TypeSpecs";

export enum ExtensionType {
	signature_algorithms = 13,
}
export namespace ExtensionType {
	export const spec = TypeSpecs.define.Enum("uint16", ExtensionType);
}

export class Extension extends TLSStruct {

	public static readonly __spec = {
		extension_type: ExtensionType.spec,
		extension_data: TypeSpecs.define.Buffer(0, 2 ** 16 - 1),
	};
	public static readonly spec = TypeSpecs.define.Struct(Extension);

	constructor(public extension_type: ExtensionType, public extension_data: Buffer) {
		super(Extension.__spec);
	}

	public static createEmpty(): Extension {
		return new Extension(null, null);
	}

}
