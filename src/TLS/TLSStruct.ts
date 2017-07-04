import { entries } from "../lib/object-polyfill";
import { BitSizes, numberToBuffer, bufferToNumber } from "../lib/BitConverter";
import * as TypeSpecs from "./TypeSpecs";
import * as util from "../lib/util";
import { Vector } from "./Vector";
import { ISerializable, ISerializableConstructor, DeserializationResult } from "./Serializable";

export type PropertyDefinition = { name: string, type: TypeSpecs.All };

/**
 * Basisklasse für TLS-Objekte
 */
export class TLSStruct {

	constructor(spec: TypeSpecs.StructSpec, initial?) {
		// Eigenschaften aus Spec kopieren
		this.__spec__ = spec;
		for (let [key, value] of entries(spec)) {
			this.propertyDefinitions.push({
				name: key,
				type: value
			});

			if (initial != undefined && initial.hasOwnProperty(key)) {
				// sonst evtl. die Eigenschaft initialisieren
				this[key] = initial[key];
			}
		}
	}

	private __spec__: TypeSpecs.StructSpec;
	private propertyDefinitions: PropertyDefinition[] = [];

	/**
	 * Deserialisiert die Eigenschaften dieses Objekts aus dem angegebenen Buffer
	 * @param buf - Der Buffer, aus dem gelesen werden soll
	 * @param offset - Der Index, ab dem gelesen werden soll
	 */
	deserialize(buf: Buffer, offset = 0): number {
		let delta = 0;
		for (let def of this.propertyDefinitions) {
			// Welche Eigenschaft wird ausgelesen?
			let
				propName = def.name,
				type = def.type,
				result: DeserializationResult<any>
				;
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
			}

			// Wert merken und im Array voranschreiten
			this[propName] = result.result;
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
	static from(spec: TypeSpecs.Struct, buf: Buffer, offset?: number): DeserializationResult<TLSStruct> {
		const ret = spec.structType.createEmpty() as TLSStruct;
		return { result: ret, readBytes: ret.deserialize(buf, offset) };
	}

	/**
	 * Serialisiert das Objekt in ein ein Byte-Array
	 */
	serialize(): Buffer {
		const ret = this.propertyDefinitions
			.map(def => {
				// Welche Eigenschaft wird ausgelesen?
				let
					propName = def.name,
					type = def.type,
					propValue = this[propName]
					;
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
				}
			});
		return Buffer.concat(ret);
	}

}