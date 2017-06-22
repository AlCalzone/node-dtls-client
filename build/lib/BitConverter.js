"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
/**
 * Liest eine Zahl der angegebenen Länge (bits) aus dem Byte-Array (arr) ab Position (offset)
 * @param bits - Die Anzahl an Bits, die verwendet werden, um die Zahl zu repräsentieren
 * @param arr - Das Byte-Array, aus dem gelesen werden soll
 * @param offset - Der Index im Array, an dem mit dem Lesen begonnen werden soll
 */
function _readNumber(bits, arr, offset) {
    if (offset === void 0) { offset = 0; }
    var ret = 0;
    var delta = bits / 8;
    while (bits > 0) {
        ret = ret * 256 + arr[offset];
        offset++;
        bits -= 8;
    }
    return { value: ret, delta: delta };
}
/**
 * Schreibt eine Zahl (value) der angegebenen Länge (bits) in das Byte-Array (arr) ab Position (offset)
 * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück
 * @param value - Die Zahl, die geschrieben werden soll
 * @param bits - Die Anzahl an Bits, die verwendet werden, um die Zahl zu repräsentieren
 * @param arr - Das Byte-Array, in das geschrieben werden soll
 * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
 */
function _writeNumber(value, bits, arr, offset) {
    if (offset === void 0) { offset = 0; }
    var delta = 0;
    if (arr == undefined) {
        // Leeren Buffer auf die richtige Größe initialisieren
        arr = Buffer.alloc(bits / 8);
        offset = 0;
    }
    while (bits > 0) {
        bits -= 8;
        arr[offset + delta] = (value >>> bits) & 0xff;
        delta++;
    }
    return { value: arr, delta: delta };
}
/**
 * Liest einen Vektor fixer Länge aus einem Byte-Array
 * @param bits - Die Anzahl an Bits, die verwendet werden, um die einzelnen Array-Einträge zu repräsentieren
 * @param length - Die Anzahl der zu lesenden Einträge
 * @param arr - Das Byte-Array, aus dem gelesen werden soll
 * @param offset - Der Index im Array, an dem mit dem Lesen begonnen werden soll
 */
function _readVectorFixed(bits, length, arr, offset) {
    if (offset === void 0) { offset = 0; }
    var ret = new Array(length);
    var delta = 0;
    var bytesPerNumber = bits / 8;
    for (var i = 0; i < length; i++) {
        var output = _readNumber(bits, arr, offset + delta);
        ret[i] = output.value;
        delta += output.delta;
    }
    return { value: ret, delta: delta };
}
/**
 * schreibt einen Vektor fixer Länge in ein Byte-Array.
 * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück
 * @param vector - Der zu schreibende Vektor
 * @param bits - Die Anzahl an Bits, die verwendet werden, um die einzelnen Array-Einträge zu repräsentieren
 * @param arr - Das Byte-Array, in das geschrieben werden soll
 * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
 */
function _writeVectorFixed(vector, bits, arr, offset) {
    if (offset === void 0) { offset = 0; }
    var length = vector.length;
    if (arr == undefined) {
        // Leeren Buffer auf die richtige Größe initialisieren
        arr = Buffer.alloc(length * bits / 8);
        offset = 0;
    }
    var bytesPerNumber = bits / 8;
    var delta = 0;
    for (var i = 0; i < length; i++) {
        var result = _writeNumber(vector[i], bits, arr, offset + delta);
        delta += result.delta;
    }
    return { value: arr, delta: delta };
}
/**
 * Liest einen Vektor variabler Länge aus einem Byte-Array
 * @param bits - Die Anzahl an Bits, die verwendet werden, um die einzelnen Array-Einträge zu repräsentieren
 * @param maxLength - Die maximale Anzahl der Einträge des zu lesenden Vektors
 * @param arr - Das Byte-Array, aus dem gelesen werden soll
 * @param offset - Der Index im Array, an dem mit dem Lesen begonnen werden soll
 */
function _readVectorVariable(bits, maxLength, arr, offset) {
    if (offset === void 0) { offset = 0; }
    // Länge auslesen, dazu bestimmen wie viele Bytes für die Längenangabe nötig sind
    var lengthBits = util_1.fitToWholeBytes(maxLength * bits / 8) * 8;
    var output = _readNumber(lengthBits, arr, offset);
    var numBytes = output.value;
    var numItems = numBytes / (bits / 8);
    var delta = output.delta;
    // Daten auslesen
    var ret = new Array(numItems);
    var bytesPerNumber = bits / 8;
    for (var i = 0; i < numItems; i++) {
        output = _readNumber(bits, arr, offset + delta);
        ret[i] = output.value;
        delta += output.delta;
    }
    //delta += numItems * bytesPerNumber;
    return { value: ret, delta: delta };
}
/**
 * schreibt einen Vektor variabler Länge in ein Byte-Array.
 * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück.
 * @param vector - Der zu schreibende Vektor
 * @param bits - Die Anzahl an Bits, die verwendet werden, um die einzelnen Array-Einträge zu repräsentieren
 * @param maxLength - Die maximale Anzahl der Einträge des zu lesenden Vektors
 * @param arr - Das Byte-Array, in das geschrieben werden soll
 * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
 */
function _writeVectorVariable(vector, bits, maxLength, arr, offset) {
    if (offset === void 0) { offset = 0; }
    var numEntries = vector.length;
    var numBytes = numEntries * bits / 8;
    // bestimmen wie viele Bytes für die Längenangabe nötig sind
    var lengthBytes = util_1.fitToWholeBytes(maxLength * bits / 8);
    if (arr == undefined) {
        // Leeren Buffer auf die richtige Größe initialisieren
        arr = Buffer.alloc(lengthBytes + numBytes);
        offset = 0;
    }
    // Längenangabe schreiben
    var output = _writeNumber(numBytes, lengthBytes * 8, arr, offset);
    var delta = output.delta;
    // Daten schreiben
    var bytesPerNumber = bits / 8;
    for (var i = 0; i < numEntries; i++) {
        output = _writeNumber(vector[i], bits, arr, offset + delta);
        delta += output.delta;
    }
    return { value: arr, delta: delta };
}
// Typisierte Methoden definieren
/**
 * Liest eine Zahl aus dem übergebenen Array (arr) ab Position (offset)
 * @param arr - Das Array, aus dem gelesen werden soll
 * @param offset - Der Index ab dem mit dem Lesen begonnen werden soll
 */
exports.readNumber = {};
/**
 * Schreibt eine Zahl (value) in das Byte-Array (arr) ab Position (offset).
 * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück.
 * @param value - Die Zahl, die geschrieben werden soll
 * @param arr - Das Byte-Array, in das geschrieben werden soll
 * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
 */
exports.writeNumber = {};
/**
 * Liest einen Vektor fixer Länge aus einem Byte-Array
 * @param length - Die Anzahl der zu lesenden Einträge
 * @param arr - Das Byte-Array, aus dem gelesen werden soll
 * @param offset - Der Index im Array, an dem mit dem Lesen begonnen werden soll
 */
exports.readVectorFixed = {};
/**
 * schreibt einen Vektor fixer Länge in ein Byte-Array.
 * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück
 * @param vector - Der zu schreibende Vektor
 * @param arr - Das Byte-Array, in das geschrieben werden soll
 * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
 */
exports.writeVectorFixed = {};
/**
 * Liest einen Vektor variabler Länge aus einem Byte-Array
 * @param maxLength - Die maximale Anzahl der Einträge des zu lesenden Vektors
 * @param arr - Das Byte-Array, aus dem gelesen werden soll
 * @param offset - Der Index im Array, an dem mit dem Lesen begonnen werden soll
 */
exports.readVectorVariable = {};
/**
 * schreibt einen Vektor variabler Länge in ein Byte-Array.
 * Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück.
 * @param vector - Der zu schreibende Vektor
 * @param maxLength - Die maximale Anzahl der Einträge des zu lesenden Vektors
 * @param arr - Das Byte-Array, in das geschrieben werden soll
 * @param offset - Der Index im Array, an dem mit dem Schreiben begonnen werden soll
 */
exports.writeVectorVariable = {};
var _loop_1 = function (bits) {
    exports.readNumber["uint" + bits] = function (arr, offset) { return _readNumber(bits, arr, offset); };
    exports.writeNumber["uint" + bits] = function (value, arr, offset) { return _writeNumber(value, bits, arr, offset); };
    exports.readVectorFixed["uint" + bits] = function (length, arr, offset) { return _readVectorFixed(bits, length, arr, offset); };
    exports.writeVectorFixed["uint" + bits] = function (vector, arr, offset) { return _writeVectorFixed(vector, bits, arr, offset); };
    exports.readVectorVariable["uint" + bits] = function (maxLength, arr, offset) { return _readVectorVariable(bits, maxLength, arr, offset); };
    exports.writeVectorVariable["uint" + bits] = function (vector, maxLength, arr, offset) { return _writeVectorVariable(vector, bits, maxLength, arr, offset); };
};
// und in das Objekt übernehmen
for (var _i = 0, _a = [8, 16, 24, 32, 48, 64]; _i < _a.length; _i++) {
    var bits = _a[_i];
    _loop_1(bits);
}
//# sourceMappingURL=BitConverter.js.map