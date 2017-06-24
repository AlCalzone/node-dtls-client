//import { fitToWholeBytes } from "./util";
//import * as TypeSpecs from "./TypeSpecs";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//export type Vector = number[];
//export type BitConverterResult<T> = {
//	/** Das Ergebnis der BitConverter-Funktion */
//	value: T,
//	/** Die Anzahl an Bytes die gelesen bzw. geschrieben wurden */
//	delta: number
//};
function numberToBuffer(value, size) {
    var n = size / 8;
    var ret = Buffer.alloc(n);
    for (var i = n - 1; i >= 0; i--) {
        ret[i] = value & 0xff;
        value >>>= 8;
    }
    return ret;
}
exports.numberToBuffer = numberToBuffer;
function bufferToNumber(buf, size, offset) {
    if (offset === void 0) { offset = 0; }
    var ret = 0;
    var n = size / 8;
    for (var i = 0; i < n; i++) {
        ret = ret * 256 + buf[i + offset];
    }
    return ret;
}
exports.bufferToNumber = bufferToNumber;
///**
// * Liest eine Zahl der angegebenen Länge (bits) aus dem Byte-Array (arr) ab Position (offset)
// * @param bits - Die Anzahl an Bits, die verwendet werden, um die Zahl zu repräsentieren
// * @param arr - Das Byte-Array, aus dem gelesen werden soll
// * @param offset - Der Index im Array, an dem mit dem Lesen begonnen werden soll
// */
//function _readNumber(bits: BitSizes, arr: Buffer, offset = 0): BitConverterResult<number> {
//	let ret = 0;
//	const delta = bits / 8;
//	while (bits > 0) {
//		ret = ret * 256 + arr[offset];
//		offset++;
//		bits -= 8;
//	}
//	return { value: ret, delta };
//}
///**
// * Schreibt eine Zahl (value) der angegebenen Länge (bits) in das Byte-Array (arr) ab Position (offset)
// * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück
// * @param value - Die Zahl, die geschrieben werden soll
// * @param bits - Die Anzahl an Bits, die verwendet werden, um die Zahl zu repräsentieren
// * @param arr - Das Byte-Array, in das geschrieben werden soll
// * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
// */
//function _writeNumber(value: number, bits: BitSizes, arr?: Buffer, offset = 0): BitConverterResult<Buffer> {
//	let delta = 0;
//	if (arr == undefined) {
//		// Leeren Buffer auf die richtige Größe initialisieren
//		arr = Buffer.alloc(bits / 8);
//		offset = 0;
//	}
//	while (bits > 0) {
//		bits -= 8;
//		arr[offset + delta] = (value >>> bits) & 0xff;
//		delta++;
//	}
//	return { value: arr, delta };
//}
///**
// * Liest einen Vektor fixer Länge aus einem Byte-Array
// * @param bits - Die Anzahl an Bits, die verwendet werden, um die einzelnen Array-Einträge zu repräsentieren
// * @param length - Die Anzahl der zu lesenden Einträge
// * @param arr - Das Byte-Array, aus dem gelesen werden soll
// * @param offset - Der Index im Array, an dem mit dem Lesen begonnen werden soll
// */
//function  _readVectorFixed(bits: BitSizes, length: number, arr?: Buffer, offset = 0) : BitConverterResult<Vector> {
//	let ret = new Array(length);
//	let delta = 0;
//	const bytesPerNumber = bits / 8;
//	for (let i = 0; i < length; i++) {
//		let output = _readNumber(bits, arr, offset + delta);
//		ret[i] = output.value;
//		delta += output.delta;
//	}
//	return { value: ret, delta };
//}
///**
// * schreibt einen Vektor fixer Länge in ein Byte-Array.
// * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück
// * @param vector - Der zu schreibende Vektor
// * @param bits - Die Anzahl an Bits, die verwendet werden, um die einzelnen Array-Einträge zu repräsentieren
// * @param arr - Das Byte-Array, in das geschrieben werden soll
// * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
// */
//function _writeVectorFixed(vector: Vector, bits: BitSizes, arr?: Buffer, offset = 0): BitConverterResult<Buffer> {
//	const length = vector.length;
//	if (arr == undefined) {
//		// Leeren Buffer auf die richtige Größe initialisieren
//		arr = Buffer.alloc(length * bits / 8);
//		offset = 0;
//	}
//	const bytesPerNumber = bits / 8;
//	let delta = 0;
//	for (let i = 0; i < length; i++) {
//		let result = _writeNumber(vector[i], bits, arr, offset + delta);
//		delta += result.delta;
//	}
//	return { value: arr, delta };
//}
///**
// * Liest einen Vektor variabler Länge aus einem Byte-Array
// * @param bits - Die Anzahl an Bits, die verwendet werden, um die einzelnen Array-Einträge zu repräsentieren
// * @param maxLength - Die maximale Anzahl der Einträge des zu lesenden Vektors
// * @param arr - Das Byte-Array, aus dem gelesen werden soll
// * @param offset - Der Index im Array, an dem mit dem Lesen begonnen werden soll
// */
//function _readVectorVariable(bits: BitSizes, maxLength: number, arr?: Buffer, offset = 0): BitConverterResult<Vector> {
//	// Länge auslesen, dazu bestimmen wie viele Bytes für die Längenangabe nötig sind
//	const lengthBits = fitToWholeBytes(maxLength * bits / 8) * 8 as BitSizes;
//	let output = _readNumber(lengthBits, arr, offset);
//	const numBytes = output.value;
//	const numItems = numBytes / (bits / 8);
//	let delta = output.delta;
//	// Daten auslesen
//	let ret = new Array(numItems);
//	const bytesPerNumber = bits / 8;
//	for (let i = 0; i < numItems; i++) {
//		output = _readNumber(bits, arr, offset + delta);
//		ret[i] = output.value;
//		delta += output.delta;
//	}
//	//delta += numItems * bytesPerNumber;
//	return { value: ret, delta };
//}
///**
// * schreibt einen Vektor variabler Länge in ein Byte-Array.
// * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück.
// * @param vector - Der zu schreibende Vektor
// * @param bits - Die Anzahl an Bits, die verwendet werden, um die einzelnen Array-Einträge zu repräsentieren
// * @param maxLength - Die maximale Anzahl der Einträge des zu lesenden Vektors
// * @param arr - Das Byte-Array, in das geschrieben werden soll
// * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
// */
//function _writeVectorVariable(vector: Vector, bits: BitSizes, maxLength: number, arr?: Buffer, offset = 0): BitConverterResult<Buffer> {
//	const numEntries = vector.length;
//	const numBytes = numEntries * bits / 8;
//	// bestimmen wie viele Bytes für die Längenangabe nötig sind
//	const lengthBytes = fitToWholeBytes(maxLength * bits / 8);
//	if (arr == undefined) {
//		// Leeren Buffer auf die richtige Größe initialisieren
//		arr = Buffer.alloc(lengthBytes + numBytes);
//		offset = 0;
//	}
//	// Längenangabe schreiben
//	let output = _writeNumber(numBytes, lengthBytes * 8 as BitSizes, arr, offset)
//	let delta = output.delta;
//	// Daten schreiben
//	const bytesPerNumber = bits / 8;
//	for (let i = 0; i < numEntries; i++) {
//		output = _writeNumber(vector[i], bits, arr, offset + delta);
//		delta += output.delta;
//	}
//	return { value: arr, delta };
//}
//// Typisierte Methoden definieren
///**
// * Liest eine Zahl aus dem übergebenen Array (arr) ab Position (offset)
// * @param arr - Das Array, aus dem gelesen werden soll
// * @param offset - Der Index ab dem mit dem Lesen begonnen werden soll
// */
//export const readNumber: {
//	[type in TypeSpecs.Numbers]?: (arr?: Buffer, offset?: number) => BitConverterResult<number>
//} = {};
///**
// * Schreibt eine Zahl (value) in das Byte-Array (arr) ab Position (offset).
// * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück.
// * @param value - Die Zahl, die geschrieben werden soll
// * @param arr - Das Byte-Array, in das geschrieben werden soll
// * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
// */
//export const writeNumber: {
//	[type in TypeSpecs.Numbers]?: (value: number, arr?: Buffer, offset?: number) => BitConverterResult<Buffer>
//} = {};
///**
// * Liest einen Vektor fixer Länge aus einem Byte-Array
// * @param length - Die Anzahl der zu lesenden Einträge
// * @param arr - Das Byte-Array, aus dem gelesen werden soll
// * @param offset - Der Index im Array, an dem mit dem Lesen begonnen werden soll
// */
//export const readVectorFixed: {
//	[type in TypeSpecs.Numbers]?: (length: number, arr?: Buffer, offset?: number) => BitConverterResult<Vector>
//} = {};
///**
// * schreibt einen Vektor fixer Länge in ein Byte-Array.
// * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück
// * @param vector - Der zu schreibende Vektor
// * @param arr - Das Byte-Array, in das geschrieben werden soll
// * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
// */
//export const writeVectorFixed: {
//	[type in TypeSpecs.Numbers]?: (vector: Vector, arr?: Buffer, offset?: number) => BitConverterResult<Buffer>
//} = {};
///**
// * Liest einen Vektor variabler Länge aus einem Byte-Array
// * @param maxLength - Die maximale Anzahl der Einträge des zu lesenden Vektors
// * @param arr - Das Byte-Array, aus dem gelesen werden soll
// * @param offset - Der Index im Array, an dem mit dem Lesen begonnen werden soll
// */
//export const readVectorVariable: {
//	[type in TypeSpecs.Numbers]?: (maxLength: number, arr?: Buffer, offset?: number) => BitConverterResult<Vector>
//} = {};
///**
// * schreibt einen Vektor variabler Länge in ein Byte-Array.
// * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück.
// * @param vector - Der zu schreibende Vektor
// * @param maxLength - Die maximale Anzahl der Einträge des zu lesenden Vektors
// * @param arr - Das Byte-Array, in das geschrieben werden soll
// * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
// */
//export const writeVectorVariable: {
//	[type in TypeSpecs.Numbers]?: (vector: Vector, maxLength: number, arr?: Buffer, offset?: number) => BitConverterResult<Buffer>
//} = {};
//// und in das Objekt übernehmen
//for (let bits of [8, 16, 24, 32, 48, 64]) {
//	readNumber[`uint${bits}`] = (arr?, offset?) => _readNumber(bits as BitSizes, arr, offset);
//	writeNumber[`uint${bits}`] = (value, arr?, offset?) => _writeNumber(value, bits as BitSizes, arr, offset);
//	readVectorFixed[`uint${bits}`] = (length, arr?, offset?) => _readVectorFixed(bits as BitSizes, length, arr, offset);
//	writeVectorFixed[`uint${bits}`] = (vector, arr?, offset?) => _writeVectorFixed(vector, bits as BitSizes, arr, offset);
//	readVectorVariable[`uint${bits}`] = (maxLength, arr?, offset?) => _readVectorVariable(bits as BitSizes, maxLength, arr, offset);
//	writeVectorVariable[`uint${bits}`] = (vector, maxLength, arr?, offset?) => _writeVectorVariable(vector, bits as BitSizes, maxLength, arr, offset);
//} 
//# sourceMappingURL=BitConverter.js.map