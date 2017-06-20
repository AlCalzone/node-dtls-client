/// <reference types="node" />
import * as TLSTypes from "./TLSTypes";
export declare type PropertyDefinition = {
    name: string;
    type: TLSTypes.All;
};
/**
 * Basisklasse für TLS-Objekte
 */
export declare class TLSStruct {
    constructor(spec: TLSTypes.StructSpec, initial?: any);
    private __spec__;
    private propertyDefinitions;
    /**
     * Deserialisiert die Eigenschaften dieses Objekts aus dem angegebenen Byte-Array
     * @param arr - Das Array, aus dem gelesen werden soll
     * @param offset - Der Index, ab dem gelesen werden soll
     */
    deserialize(arr: Buffer, offset?: number): {
        value: TLSStruct;
        delta: number;
    };
    /**
     * Erzeugt eine TLSStruct der angegebenen Definition aus einem Byte-Array
     * @param spec - Definiert, wie das deserialisierte Objekt aufgebaut ist
     * @param arr - Das Array, aus dem gelesen werden soll
     * @param offset - Der Index, ab dem gelesen werden soll
     */
    static from(spec: TLSTypes.StructSpec, arr: Buffer, offset?: number): TLSStruct;
    private static _from(spec, arr, offset?);
    /**
     * Serialisiert das Objekt in ein ein Byte-Array
     */
    serialize(): Buffer;
}
