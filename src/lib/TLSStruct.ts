"use strict";
import { entries } from "./object-polyfill";
import * as BitConverter from "./BitConverter";
import * as TLSTypes from "./TLSTypes";

export type PropertyDefinition = { name: string, type: TLSTypes.All };

/**
 * Basisklasse für TLS-Objekte
 */
export class TLSStruct {

	constructor(public spec: TLSTypes.StructSpec, initial?) {
		// Eigenschaften aus Spec kopieren
		for (let [key, value] of entries(spec)) {
			this.propertyDefinitions.push({
				name: key,
				type: value
			});
			// und evtl. die Eigenschaft initialisieren
			if (initial != undefined && initial.hasOwnProperty(key)) {
				this[key] = initial[key];
			}
		}
	}

	private propertyDefinitions: PropertyDefinition[] = [];

	/**
	 * Deserialisiert ein Byte-Array in ein Objekt des spezifizierten Typs
	 * @param spec - Definiert, wie das deserialisierte Objekt aufgebaut ist
	 * @param arr - Das Array, aus dem gelesen werden soll
	 * @param offset - Der Index, ab dem gelesen werden soll
	 */
	static deserialize(spec: TLSTypes.StructSpec, arr: number[], offset = 0) {
		return TLSStruct._deserialize(spec, arr, offset).value;
	}

	private static _deserialize(spec: TLSTypes.StructSpec, arr: number[], offset = 0) {
		const ret = new TLSStruct(spec);
		let delta = 0;
		for (let def of ret.propertyDefinitions) {
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
				result = TLSStruct._deserialize(type.spec, arr, offset + delta);
			} else {
				throw new TypeError("unknown message type specified");
			}
			// Wert merken und im Array voranschreiten
			ret[propName] = result.value;
			delta += result.delta;
		}
		return { value: ret, delta };
	}

	/**
	 * Serialisiert das Objekt in ein ein Byte-Array
	 */
	serialize() {
		return this.propertyDefinitions
			.map(def => {
				// Welche Eigenschaft wird ausgelesen?
				const
					propName = def.name,
					type = def.type,
					propValue = this[propName]
					;
				let result: BitConverter.BitConverterResult<number[]>;
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
			})
			.reduce((prev, cur) => prev.concat(cur), [])
			;
	}

}