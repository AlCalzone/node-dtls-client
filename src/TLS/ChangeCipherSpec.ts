import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";


export enum ChangeCipherSpecTypes {
	change_cipher_spec = 1
};
export namespace ChangeCipherSpecTypes {
	export const __spec = TypeSpecs.define.Enum("uint8", ChangeCipherSpecTypes);
}

export class ChangeCipherSpec extends TLSStruct {

	static readonly __spec = {
		type: TypeSpecs.define.Enum("uint8", ChangeCipherSpec)
	}

	constructor(public type: ChangeCipherSpecTypes) {
		super(ChangeCipherSpec.__spec);
	}

	static createEmpty(): ChangeCipherSpec {
		return new ChangeCipherSpec(ChangeCipherSpecTypes.change_cipher_spec);
	}

}