import { BitSizes, bufferToNumber, numberToBuffer } from "../lib/BitConverter";
import { entries } from "../lib/object-polyfill";
import * as util from "../lib/util";
import { DeserializationResult } from "./Serializable";
import * as TypeSpecs from "./TypeSpecs";
import { Vector } from "./Vector";

export interface PropertyDefinition { name: string; type: TypeSpecs.All; }

/**
 * Basisklasse für TLS-Objekte
 */
export class TLSStruct {

	constructor(spec: TypeSpecs.StructSpec, initial?: Record<string, any>) {
		// Eigenschaften aus Spec kopieren
		// this.__spec__ = spec;
		for (const [key, value] of entries(spec)) {
			this.propertyDefinitions.push({
				name: key,
				type: value,
			});

			if (initial != undefined && initial.hasOwnProperty(key)) {
				// sonst evtl. die Eigenschaft initialisieren
				(this as any)[key] = initial[key];
			}
		}
	}

	// private __spec__: TypeSpecs.StructSpec;
	private propertyDefinitions: PropertyDefinition[] = [];

	/**
	 * Deserialisiert die Eigenschaften dieses Objekts aus dem angegebenen Buffer
	 * @param buf - Der Buffer, aus dem gelesen werden soll
	 * @param offset - Der Index, ab dem gelesen werden soll
	 */
	public deserialize(buf: Buffer, offset = 0): number {
		let delta = 0;
		for (const def of this.propertyDefinitions) {
			// Welche Eigenschaft wird ausgelesen?
			const propName = def.name;
			const type = def.type;
			let result: DeserializationResult<any>;
			switch (type.type) {
				case "number":
				case "enum":
					const bitSize = TypeSpecs.getPrimitiveSize(type) as BitSizes;
					result = { result: bufferToNumber(buf, bitSize, offset + delta), readBytes: bitSize / 8 };
					break;
				case "vector":
					result = Vector.from(type, buf, offset + delta);
					break;
				case "struct":
					result = type.structType.from(type, buf, offset + delta);
					break;
				case "buffer":
					if (type.maxLength === Number.POSITIVE_INFINITY) {
						// unbound Buffer, copy the remaining bytes
						const ret = Buffer.allocUnsafe(buf.length - (offset + delta));
						buf.copy(ret, 0, offset + delta);
						result = { result: ret, readBytes: ret.length };
					} else {
						// normal Buffer (essentially Vector<uint8>)
						let length = type.maxLength;
						let lengthBytes = 0;
						// for variable length Buffers, read the actual length first
						if (TypeSpecs.Buffer.isVariableLength(type)) {
							const lengthBits = (8 * util.fitToWholeBytes(type.maxLength)) as BitSizes;
							length = bufferToNumber(buf, lengthBits, offset + delta);
							lengthBytes += lengthBits / 8;
						}
						// copy the data into the new buffer
						const ret = Buffer.allocUnsafe(length);
						buf.copy(ret, 0, offset + delta + lengthBytes, offset + delta + lengthBytes + length);
						result = { result: ret, readBytes: lengthBytes + length };
					}
					break;
			}

			// Wert merken und im Array voranschreiten
			(this as any)[propName] = result.result;
			delta += result.readBytes;
		}
		return delta;
	}

	/**
	 * Erzeugt eine TLSStruct der angegebenen Definition aus einem Byte-Array
	 * @param spec - Definiert, wie das deserialisierte Objekt aufgebaut ist
	 * @param arr - Das Array, aus dem gelesen werden soll
	 * @param offset - Der Index, ab dem gelesen werden soll
	 */
	public static from(spec: TypeSpecs.Struct, buf: Buffer, offset?: number): DeserializationResult<TLSStruct> {
		const ret = spec.structType.createEmpty() as TLSStruct;
		return { result: ret, readBytes: ret.deserialize(buf, offset) };
	}

	/**
	 * Serialisiert das Objekt in ein ein Byte-Array
	 */
	public serialize(): Buffer {
		const ret = this.propertyDefinitions
			.map(def => {
				// Welche Eigenschaft wird ausgelesen?
				const propName = def.name;
				const type = def.type;
				const propValue = (this as any)[propName];
				switch (type.type) {
					case "number":
					case "enum":
						const bitSize = TypeSpecs.getPrimitiveSize(type) as BitSizes;
						return numberToBuffer(propValue, bitSize);
					case "vector":
						// we know propValue is a Vector<T> but we don't know or care about T
						return (propValue as any).serialize(type);
					case "struct":
						return (propValue as TLSStruct).serialize();
					case "buffer":
						// just return a copy of the buffer
						let result = Buffer.from(propValue as Buffer);
						// for variable length buffers prepend the length
						if (TypeSpecs.Buffer.isVariableLength(type)) {
							const lengthBits = (8 * util.fitToWholeBytes(type.maxLength)) as BitSizes;
							result = Buffer.concat([
								numberToBuffer(result.length, lengthBits),
								result,
							]);
						}
						return result;
				}
			});
		return Buffer.concat(ret);
	}

}
