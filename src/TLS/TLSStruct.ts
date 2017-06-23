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
	 * Deserialisiert die Eigenschaften dieses Objekts aus dem angegebenen Byte-Array
	 * @param arr - Das Array, aus dem gelesen werden soll
	 * @param offset - Der Index, ab dem gelesen werden soll
	 */
	deserialize(arr: Buffer, offset = 0): number {
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
					result = { result: bufferToNumber(arr, bitSize, offset + delta), readBytes: bitSize / 8 };
					break;
				case "vector":
					result = Vector.from(type, arr, offset + delta);
					break;
				case "struct":
					result = type.structType.from(type, arr, offset + delta);
					break;
			}


			//let result: (
			//	BitConverter.BitConverterResult<number> |
			//	BitConverter.BitConverterResult<number[]> |
			//	BitConverter.BitConverterResult<TLSStruct>
			//	);
			//// Typ ermitteln
			//if (typeof type === "string") {
			//	// Basistyp (Zahl)
			//	result = BitConverter.readNumber[type](arr, offset + delta);
			//} else if (type instanceof TypeSpecs.Enum) {
			//	// Enum
			//	result = BitConverter.readNumber[type.underlyingType](arr, offset + delta);
			//} else if (type instanceof TypeSpecs.Vector) {
			//	// Vektor (variable oder fixed)
			//	if (type.optional && offset + delta >= arr.length) {
			//		// Optionaler Vektor:
			//		// Wir sind am Ende, keine weiteren Werte lesen
			//		result = { value: [], readBytes: 0 };
			//	} else {
			//		if (type.minLength === type.maxLength) {
			//			result = BitConverter.readVectorFixed[type.underlyingType](type.maxLength, arr, offset + delta);
			//		} else {
			//			result = BitConverter.readVectorVariable[type.underlyingType](type.maxLength, arr, offset + delta);
			//		}
			//	}
			//} else if (type instanceof TypeSpecs.Struct) {
			//	// Zusammengesetzter Typ
			//	result = TLSStruct._from(type.spec, arr, offset + delta);
			//} else {
			//	throw new TypeError("unknown message type specified");
			//}
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
	//static from(spec: TypeSpecs.StructSpec, arr: Buffer, offset?: number) {
	//	return TLSStruct._from(spec, arr, offset).value;
	//}
	//private static _from(spec: TypeSpecs.StructSpec, arr: Buffer, offset?: number) {
	//	const ret = new TLSStruct(spec);
	//	return ret.deserialize(arr, offset);
	//}
	static from(spec: TypeSpecs.Struct, buf: Buffer, offset?: number): DeserializationResult<TLSStruct> {
		const ret = new spec.structType(spec.spec) as TLSStruct;
		return { result: ret, readBytes: ret.deserialize(buf) };
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
					case "struct":
						return (propValue as ISerializable).serialize(); // we know this must be an ISerializable
				}
				//let result: BitConverter.BitConverterResult<Buffer>;
				//// Typ ermitteln
				//if (typeof type === "string") {
				//	// Basistyp (Zahl)
				//	result = BitConverter.writeNumber[type](propValue);
				//} else if (type instanceof TypeSpecs.Enum) {
				//	// Enum
				//	result = BitConverter.writeNumber[type.underlyingType](propValue);
				//} else if (type instanceof TypeSpecs.Vector) {
				//	// Optionale Vektoren nur schreiben, wenn länger als 0
				//	if (type.optional && propValue.length === 0) return Buffer.from([]);
				//	// Vektor (variabel oder fixed)
				//	if (type.minLength === type.maxLength) {
				//		result = BitConverter.writeVectorFixed[type.underlyingType](propValue);
				//	} else {
				//		result = BitConverter.writeVectorVariable[type.underlyingType](propValue, type.maxLength);
				//	}
				//} else if (type instanceof TypeSpecs.Struct) {
				//	// Zusammengesetzter Typ
				//	return (propValue as TLSStruct).serialize();
				//} else {
				//	throw new TypeError("unknown message type specified");
				//}
				//return result.value;
			});
		return Buffer.concat(ret);
			//.reduce((prev, cur) => prev.concat(cur), [])
			//;
	}

	//protected getCalculatedPropertyValue(propName: string) {
	//	const definition = this.__spec__[propName] as TypeSpecs.Calculated;
	//	return this.calculateProperty(definition.calculationType, definition.propertyName);
	//}

	///**
	// * Führt Berechnungen auf Basis einer bestimmten Eigenschaft durch
	// * @param type - Der Typ der durchzuführenden Rechnung
	// * @param propName - Der Name der Eigenschaft, mit der gerechnet werden soll
	// */
	//private calculateProperty(type: TypeSpecs.CalculationTypes, propName: string) {
	//	switch (type) {
	//		case "serializedLength":
	//			return this.calculateLength(propName);
	//		default:
	//			throw Error(`unknown property calculation "${type}"`)
	//	}
	//}
	//private getNumberLength(numberType: TypeSpecs.Numbers): number {
	//	// uintXX
	//	return +(numberType.substr("uint".length)) / 8;
	//}
	///**
	// * Berechnet die Byte-Länge aller Eigenschaften dieser Struct
	// */
	//private calculateOwnLength(): number {
	//	// Länge aller Eigenschaften berechnen und aufsummieren
	//	return this.propertyDefinitions
	//		.map(pd => this.calculateLength(pd.name))
	//		.reduce((prev, cur) => prev + cur, 0)
	//		;
	//}
	///**
	// * Berechnet die Länge der angegebenen Eigenschaft
	// */
	//private calculateLength(propName: string) : number {
	//	const definition = this.__spec__[propName] as TypeSpecs.All;
	//	if (typeof definition === "string") {
	//		return this.getNumberLength(definition);
	//	} else if (definition instanceof TypeSpecs.Enum) {
	//		return this.getNumberLength(definition.underlyingType);
	//	} else if (definition instanceof TypeSpecs.Vector) {
	//		const vector = this[propName] as number[];
	//		if (definition.minLength === definition.maxLength) {
	//			// fixe Größe
	//			return this.getNumberLength(definition.underlyingType) * vector.length;
	//		} else {
	//			// variable Größe
	//			return util.fitToWholeBytes(definition.maxLength) +
	//				this.getNumberLength(definition.underlyingType) * vector.length;
	//		}
	//	} else if (definition instanceof TypeSpecs.Struct) {
	//		const struct = this[propName] as TLSStruct;
	//		return struct.calculateOwnLength();
	//	} else if (definition instanceof TypeSpecs.Calculated) {
	//		return this.getNumberLength(definition.underlyingType);
	//	}
	//}

}