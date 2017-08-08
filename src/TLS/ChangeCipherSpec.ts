import { TLSStruct } from "./TLSStruct";
import * as TypeSpecs from "./TypeSpecs";

export enum ChangeCipherSpecTypes {
	change_cipher_spec = 1,
}
export namespace ChangeCipherSpecTypes {
	export const __spec = TypeSpecs.define.Enum("uint8", ChangeCipherSpecTypes);
}

export class ChangeCipherSpec extends TLSStruct {

	public static readonly __spec = {
		type: TypeSpecs.define.Enum("uint8", ChangeCipherSpec),
	};

	constructor(public type: ChangeCipherSpecTypes) {
		super(ChangeCipherSpec.__spec);
	}

	public static createEmpty(): ChangeCipherSpec {
		return new ChangeCipherSpec(ChangeCipherSpecTypes.change_cipher_spec);
	}

}
