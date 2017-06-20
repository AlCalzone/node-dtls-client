"use strict";
import { entries } from "../lib/object-polyfill";
import * as BitConverter from "../lib/BitConverter";
import * as TLSTypes from "./TLSTypes";
import * as util from "../lib/util";

export type PropertyDefinition = { name: string, type: TLSTypes.All };

/**
 * Basisklasse für TLS-Objekte
 */
export class TLSStruct {

	constructor(spec: TLSTypes.StructSpec, initial?) {
		// Eigenschaften aus Spec kopieren
		this.__spec__ = spec;
		for (let [key, value] of entries(spec)) {
			this.propertyDefinitions.push({
				name: key,
				type: value
			});
			/*if (value instanceof TLSTypes.Calculated) {
				// getter für berechnete Eigenschaft erstellen
				Object.defineProperty(value, key, {
					get: () => this.getCalculatedPropertyValue(key)
				})
				// TODO: Testen!!!!
			} else*/ if (initial != undefined && initial.hasOwnProperty(key)) {
				// sonst evtl. die Eigenschaft initialisieren
				this[key] = initial[key];
			}
		}
	}

	private __spec__: TLSTypes.StructSpec;
	private propertyDefinitions: PropertyDefinition[] = [];

	/**
	 * Deserialisiert die Eigenschaften dieses Objekts aus dem angegebenen Byte-Array
	 * @param arr - Das Array, aus dem gelesen werden soll
	 * @param offset - Der Index, ab dem gelesen werden soll
	 */
	deserialize(arr: Buffer, offset = 0): { value: TLSStruct, delta: number } {
		let delta = 0;
		for (let def of this.propertyDefinitions) {
			// Welche Eigenschaft wird ausgelesen?
			const
				propName = def.name,
				type = def.type
				;
			let result: (
				BitConverter.BitConverterResult<number> |
				BitConverter.BitConverterResult<number[]> |
				BitConverter.BitConverterResult<TLSStruct>
				);
			// Typ ermitteln
			if (typeof type === "string") {
				// Basistyp (Zahl)
				result = BitConverter.readNumber[type](arr, offset + delta);
			} else if (type instanceof TLSTypes.Enum) {
				// Enum
				result = BitConverter.readNumber[type.underlyingType](arr, offset + delta);
			} else if (type instanceof TLSTypes.Vector) {
				// Vektor (variable oder fixed)
				if (type.minLength === type.maxLength) {
					result = BitConverter.readVectorFixed[type.underlyingType](type.maxLength, arr, offset + delta);
				} else {
					result = BitConverter.readVectorVariable[type.underlyingType](type.maxLength, arr, offset + delta);
				}
			} else if (type instanceof TLSTypes.Struct) {
				// Zusammengesetzter Typ
				result = TLSStruct._from(type.spec, arr, offset + delta);
			} else {
				throw new TypeError("unknown message type specified");
			}
			// Wert merken und im Array voranschreiten
			this[propName] = result.value;
			delta += result.delta;
		}
		return { value: this, delta };
	}

	/**
	 * Erzeugt eine TLSStruct der angegebenen Definition aus einem Byte-Array
	 * @param spec - Definiert, wie das deserialisierte Objekt aufgebaut ist
	 * @param arr - Das Array, aus dem gelesen werden soll
	 * @param offset - Der Index, ab dem gelesen werden soll
	 */
	static from(spec: TLSTypes.StructSpec, arr: Buffer, offset?: number) {
		return TLSStruct._from(spec, arr, offset).value;
	}
	private static _from(spec: TLSTypes.StructSpec, arr: Buffer, offset?: number) {
		const ret = new TLSStruct(spec);
		return ret.deserialize(arr, offset);
	}

	/**
	 * Serialisiert das Objekt in ein ein Byte-Array
	 */
	serialize(): Buffer {
		const ret = this.propertyDefinitions
			.map(def => {
				// Welche Eigenschaft wird ausgelesen?
				const
					propName = def.name,
					type = def.type,
					propValue = this[propName]
					;
				let result: BitConverter.BitConverterResult<Buffer>;
				// Typ ermitteln
				if (typeof type === "string") {
					// Basistyp (Zahl)
					result = BitConverter.writeNumber[type](propValue);
				} else if (type instanceof TLSTypes.Enum) {
					// Enum
					result = BitConverter.writeNumber[type.underlyingType](propValue);
				} else if (type instanceof TLSTypes.Vector) {
					// Vektor (variabel oder fixed)
					if (type.minLength === type.maxLength) {
						result = BitConverter.writeVectorFixed[type.underlyingType](propValue);
					} else {
						result = BitConverter.writeVectorVariable[type.underlyingType](propValue, type.maxLength);
					}
				} else if (type instanceof TLSTypes.Struct) {
					// Zusammengesetzter Typ
					return (propValue as TLSStruct).serialize();
				} else {
					throw new TypeError("unknown message type specified");
				}
				return result.value;
			});
		return Buffer.concat(ret);
			//.reduce((prev, cur) => prev.concat(cur), [])
			//;
	}

	//protected getCalculatedPropertyValue(propName: string) {
	//	const definition = this.__spec__[propName] as TLSTypes.Calculated;
	//	return this.calculateProperty(definition.calculationType, definition.propertyName);
	//}

	///**
	// * Führt Berechnungen auf Basis einer bestimmten Eigenschaft durch
	// * @param type - Der Typ der durchzuführenden Rechnung
	// * @param propName - Der Name der Eigenschaft, mit der gerechnet werden soll
	// */
	//private calculateProperty(type: TLSTypes.CalculationTypes, propName: string) {
	//	switch (type) {
	//		case "serializedLength":
	//			return this.calculateLength(propName);
	//		default:
	//			throw Error(`unknown property calculation "${type}"`)
	//	}
	//}
	//private getNumberLength(numberType: TLSTypes.Numbers): number {
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
	//	const definition = this.__spec__[propName] as TLSTypes.All;
	//	if (typeof definition === "string") {
	//		return this.getNumberLength(definition);
	//	} else if (definition instanceof TLSTypes.Enum) {
	//		return this.getNumberLength(definition.underlyingType);
	//	} else if (definition instanceof TLSTypes.Vector) {
	//		const vector = this[propName] as number[];
	//		if (definition.minLength === definition.maxLength) {
	//			// fixe Größe
	//			return this.getNumberLength(definition.underlyingType) * vector.length;
	//		} else {
	//			// variable Größe
	//			return util.fitToWholeBytes(definition.maxLength) +
	//				this.getNumberLength(definition.underlyingType) * vector.length;
	//		}
	//	} else if (definition instanceof TLSTypes.Struct) {
	//		const struct = this[propName] as TLSStruct;
	//		return struct.calculateOwnLength();
	//	} else if (definition instanceof TLSTypes.Calculated) {
	//		return this.getNumberLength(definition.underlyingType);
	//	}
	//}

}