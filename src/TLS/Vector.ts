import { BitSizes, bufferToNumber, numberToBuffer } from "../lib/BitConverter";
import { fitToWholeBytes } from "../lib/util";
import { DeserializationResult, ISerializable } from "./Serializable";
import * as TypeSpecs from "./TypeSpecs";

export class Vector<T extends number | ISerializable> {

	constructor(
		public items: T[] = [],
	) { }

	public serialize(spec: TypeSpecs.Vector): Buffer {
		// optional, empty vectors resolve to empty buffers
		if (this.items.length === 0 && spec.optional) {
			return Buffer.allocUnsafe(0);
		}
		// serialize all the items into single buffers
		let serializedItems: Buffer[];
		let bitSize: BitSizes;
		switch (spec.itemSpec.type) {
			case "number":
			case "enum":
				bitSize = TypeSpecs.getPrimitiveSize(spec.itemSpec) as BitSizes;
				serializedItems = (this.items as number[]).map(v => numberToBuffer(v, bitSize));
				break;

			case "struct":
				serializedItems = (this.items as ISerializable[]).map(v => v.serialize());
			}
		let ret = Buffer.concat(serializedItems);
		// for variable length vectors, prepend the maximum length
		if (TypeSpecs.Vector.isVariableLength(spec)) {
			const lengthBits = (8 * fitToWholeBytes(spec.maxLength)) as BitSizes;
			ret = Buffer.concat([
				numberToBuffer(ret.length, lengthBits),
				ret,
			]);
		}
		return ret;

	}
	private deserialize(spec: TypeSpecs.Vector, buf: Buffer, offset = 0): number {
		// for variable length vectors, read the length first
		let length = spec.maxLength;
		let delta = 0;
		if (TypeSpecs.Vector.isVariableLength(spec)) {
			const lengthBits = (8 * fitToWholeBytes(spec.maxLength)) as BitSizes;
			length = bufferToNumber(buf, lengthBits, offset);
			delta += lengthBits / 8;
		}
		let i: number;
		switch (spec.itemSpec.type) {
			case "number":
			case "enum":
				const bitSize = TypeSpecs.getPrimitiveSize(spec.itemSpec) as BitSizes;
				for (i = 0; i < length; i += bitSize / 8) {
					this.items.push(bufferToNumber(buf, bitSize, offset + delta) as any as T); // we know this is a number!
					delta += bitSize / 8;
				}
				break;
			case "struct":
				i = 0;
				while (i < length) {
					const item = spec.itemSpec.structType.from(spec.itemSpec, buf, offset + delta);
					if (item.readBytes <= 0) {
						// this shouldn't happen, but we don't want to introduce an infinite loop
						throw new Error(`Zero or less bytes read while parsing TLS struct.`);
					}
					i += item.readBytes;
					delta += item.readBytes;
					this.items.push(item.result as any as T); // we know this is a struct/ISerializable
				}
		}
		return delta;
	}

	public static from<T extends number | ISerializable>(spec: TypeSpecs.Vector, buf: Buffer, offset?: number): DeserializationResult<Vector<T>> {
		const ret = new Vector<T>();
		if (buf.length === 0) {
			if (spec.optional) return { result: ret, readBytes: 0 };
			throw new Error("nothing to deserialize");
		} else {
			return { result: ret, readBytes: ret.deserialize(spec, buf, offset) };
		}
	}

}
