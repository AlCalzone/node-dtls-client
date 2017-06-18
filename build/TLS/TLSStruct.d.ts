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
    spec: TLSTypes.StructSpec;
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
    protected getCalculatedPropertyValue(propName: string): number;
    /**
     * Führt Berechnungen auf Basis einer bestimmten Eigenschaft durch
     * @param type - Der Typ der durchzuführenden Rechnung
     * @param propName - Der Name der Eigenschaft, mit der gerechnet werden soll
     */
    private calculateProperty(type, propName);
    private getNumberLength(numberType);
    /**
     * Berechnet die Byte-Länge aller Eigenschaften dieser Struct
     */
    private calculateOwnLength();
    /**
     * Berechnet die Länge der angegebenen Eigenschaft
     */
    private calculateLength(propName);
}
