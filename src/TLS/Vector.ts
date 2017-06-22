import * as TLSTypes from "./TLSTypes";
import { ISerializable } from "./ISerializable";

export class Vector<T extends TLSTypes.Numbers | ISerializable<T>> extends Array<T> implements ISerializable<T> {

	constructor(
		source: T[],
		public minLength: number = 0,
		public maxLength: number = minLength,
		public optional: boolean = false
	) {
		super(...source);
	}

	get isVariableLength(): boolean {
		return this.maxLength !== this.minLength;
	}

	serialize(): Buffer {
		// optional, empty vectors resolve to empty buffers
		if (this.length === 0 && this.optional) {
			return Buffer.allocUnsafe(0);
		}
		// for variable length
		let x = this[0];
		if (typeof x === "number") {
		} else {
			let y = x;
		}
		throw new Error('Method not implemented.');
	}
	deserialize(buf: Buffer, offset: number): T {
		throw new Error('Method not implemented.');
	}


}