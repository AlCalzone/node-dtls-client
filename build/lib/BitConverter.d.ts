/// <reference types="node" />
import * as TLSTypes from "../TLS/TLSTypes";
export declare type BitSizes = 8 | 16 | 24 | 32 | 48 | 64;
export declare type Vector = number[];
export declare type BitConverterResult<T> = {
    /** Das Ergebnis der BitConverter-Funktion */
    value: T;
    /** Die Anzahl an Bytes die gelesen bzw. geschrieben wurden */
    delta: number;
};
/**
 * Liest eine Zahl aus dem übergebenen Array (arr) ab Position (offset)
 * @param arr - Das Array, aus dem gelesen werden soll
 * @param offset - Der Index ab dem mit dem Lesen begonnen werden soll
 */
export declare const readNumber: {
    [type in TLSTypes.Numbers]?: (arr?: Buffer, offset?: number) => BitConverterResult<number>;
};
/**
 * Schreibt eine Zahl (value) in das Byte-Array (arr) ab Position (offset).
 * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück.
 * @param value - Die Zahl, die geschrieben werden soll
 * @param arr - Das Byte-Array, in das geschrieben werden soll
 * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
 */
export declare const writeNumber: {
    [type in TLSTypes.Numbers]?: (value: number, arr?: Buffer, offset?: number) => BitConverterResult<Buffer>;
};
/**
 * Liest einen Vektor fixer Länge aus einem Byte-Array
 * @param length - Die Anzahl der zu lesenden Einträge
 * @param arr - Das Byte-Array, aus dem gelesen werden soll
 * @param offset - Der Index im Array, an dem mit dem Lesen begonnen werden soll
 */
export declare const readVectorFixed: {
    [type in TLSTypes.Numbers]?: (length: number, arr?: Buffer, offset?: number) => BitConverterResult<Vector>;
};
/**
 * schreibt einen Vektor fixer Länge in ein Byte-Array.
 * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück
 * @param vector - Der zu schreibende Vektor
 * @param arr - Das Byte-Array, in das geschrieben werden soll
 * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
 */
export declare const writeVectorFixed: {
    [type in TLSTypes.Numbers]?: (vector: Vector, arr?: Buffer, offset?: number) => BitConverterResult<Buffer>;
};
/**
 * Liest einen Vektor variabler Länge aus einem Byte-Array
 * @param maxLength - Die maximale Anzahl der Einträge des zu lesenden Vektors
 * @param arr - Das Byte-Array, aus dem gelesen werden soll
 * @param offset - Der Index im Array, an dem mit dem Lesen begonnen werden soll
 */
export declare const readVectorVariable: {
    [type in TLSTypes.Numbers]?: (maxLength: number, arr?: Buffer, offset?: number) => BitConverterResult<Vector>;
};
/**
 * schreibt einen Vektor variabler Länge in ein Byte-Array.
 * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück.
 * @param vector - Der zu schreibende Vektor
 * @param maxLength - Die maximale Anzahl der Einträge des zu lesenden Vektors
 * @param arr - Das Byte-Array, in das geschrieben werden soll
 * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
 */
export declare const writeVectorVariable: {
    [type in TLSTypes.Numbers]?: (vector: Vector, maxLength: number, arr?: Buffer, offset?: number) => BitConverterResult<Buffer>;
};
