"use strict";
var util_1 = require("./util");
var BitConverter = (function () {
    function BitConverter() {
    }
    // Liest eine Zahl der angegebenen Länge <bits> aus dem Byte-Array <arr> ab Position <offset>
    BitConverter._readNumber = function (bits, arr, offset) {
        if (offset === void 0) { offset = 0; }
        var ret = 0;
        var delta = bits / 8;
        while (bits > 0) {
            ret = ret * 256 + arr[offset];
            offset++;
            bits -= 8;
        }
        return { value: ret, delta: delta };
    };
    // Schreibt eine Zahl <value> der angegebenen Länge <bits> in das Byte-Array <arr> ab Position <offset>
    // Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück
    BitConverter._writeNumber = function (value, bits, arr, offset) {
        if (offset === void 0) { offset = 0; }
        var delta = 0;
        if (arr == undefined) {
            // Leeres Array auf die richtige Größe initialisieren
            arr = new Array(bits / 8);
            offset = 0;
        }
        while (bits > 0) {
            bits -= 8;
            arr[offset + delta] = (value >>> bits) & 0xff;
            delta++;
        }
        return { value: arr, delta: delta };
    };
    // Liest einen Vektor fixer Länge aus einem Byte-Array
    BitConverter._readVectorFixed = function (typeBits, length, arr, offset) {
        if (offset === void 0) { offset = 0; }
        var ret = new Array(length);
        var delta = 0;
        var bytesPerNumber = typeBits / 8;
        for (var i = 0; i < length; i++) {
            var output = BitConverter._readNumber(typeBits, arr, offset + delta);
            ret[i] = output.value;
            delta += output.delta;
        }
        return { value: ret, delta: delta };
    };
    // schreibt einen Vektor fixer Länge in ein Byte-Array.
    // Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück
    BitConverter._writeVectorFixed = function (vector, typeBits, arr, offset) {
        if (offset === void 0) { offset = 0; }
        var length = vector.length;
        if (arr == undefined) {
            // Leeres Array auf die richtige Größe initialisieren
            arr = new Array(length * typeBits / 8);
            offset = 0;
        }
        var bytesPerNumber = typeBits / 8;
        var delta = 0;
        for (var i = 0; i < length; i++) {
            var result = BitConverter._writeNumber(vector[i], typeBits, arr, offset + delta);
            delta += result.delta;
        }
        return { value: arr, delta: delta };
    };
    // Liest einen Vektor variabler Länge aus einem Byte-Array
    BitConverter._readVectorVariable = function (typeBits, maxLength, arr, offset) {
        if (offset === void 0) { offset = 0; }
        // Länge auslesen, dazu bestimmen wie viele Bytes für die Längenangabe nötig sind
        var lengthBits = util_1.fitToWholeBytes(maxLength * typeBits / 8) * 8;
        var output = BitConverter._readNumber(lengthBits, arr, offset);
        var numBytes = output.value;
        var numItems = numBytes / (typeBits / 8);
        var delta = output.delta;
        // Daten auslesen
        var ret = new Array(numItems);
        var bytesPerNumber = typeBits / 8;
        for (var i = 0; i < numItems; i++) {
            output = BitConverter._readNumber(typeBits, arr, offset + delta);
            ret[i] = output.value;
            delta += output.delta;
        }
        //delta += numItems * bytesPerNumber;
        return { value: ret, delta: delta };
    };
    // schreibt einen Vektor variabler Länge in ein Byte-Array.
    // Legt das Array an, sofern es nicht existiert und gibt das beschriebene Array zurück
    BitConverter._writeVectorVariable = function (vector, typeBits, maxLength, arr, offset) {
        if (offset === void 0) { offset = 0; }
        var numEntries = vector.length;
        var numBytes = numEntries * typeBits / 8;
        // bestimmen wie viele Bytes für die Längenangabe nötig sind
        var lengthBytes = util_1.fitToWholeBytes(maxLength * typeBits / 8);
        if (arr == undefined) {
            // Leeres Array auf die richtige Größe initialisieren
            arr = new Array(lengthBytes + numBytes);
            offset = 0;
        }
        // Längenangabe schreiben
        var output = BitConverter._writeNumber(numBytes, lengthBytes * 8, arr, offset);
        var delta = output.delta;
        // Daten schreiben
        var bytesPerNumber = typeBits / 8;
        for (var i = 0; i < numEntries; i++) {
            output = BitConverter._writeNumber(vector[i], typeBits, arr, offset + delta);
            delta += output.delta;
        }
        return { value: arr, delta: delta };
    };
    return BitConverter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BitConverter;
// Typisierte Methoden definieren
BitConverter.readNumber = {};
var readNumberFactory = function (bits) {
    return function (arr, offset) { return BitConverter._readNumber(bits, arr, offset); };
};
BitConverter.writeNumber = {};
var writeNumberFactory = function (bits) {
    return function (value, arr, offset) { return BitConverter._writeNumber(value, bits, arr, offset); };
};
BitConverter.readVectorFixed = {};
var readVectorFixedFactory = function (bits) {
    // Length is the number of items, NOT the number of bytes like in the TLS specs
    return function (length, arr, offset) { return BitConverter._readVectorFixed(bits, length, arr, offset); };
};
BitConverter.writeVectorFixed = {};
var writeVectorFixedFactory = function (bits) {
    return function (vector, arr, offset) { return BitConverter._writeVectorFixed(vector, bits, arr, offset); };
};
BitConverter.readVectorVariable = {};
var readVectorVariableFactory = function (bits) {
    // maxLength is the number of items, NOT the number of bytes like in the TLS specs
    return function (maxLength, arr, offset) { return BitConverter._readVectorVariable(bits, maxLength, arr, offset); };
};
BitConverter.writeVectorVariable = {};
var writeVectorVariableFactory = function (bits) {
    return function (vector, maxLength, arr, offset) { return BitConverter._writeVectorVariable(vector, bits, maxLength, arr, offset); };
};
// und in das OBjekt übernehmen
for (var _i = 0, _a = [8, 16, 24, 32, 64]; _i < _a.length; _i++) {
    var bits = _a[_i];
    BitConverter.readNumber["uint" + bits] = readNumberFactory(bits);
    BitConverter.writeNumber["uint" + bits] = writeNumberFactory(bits);
    BitConverter.readVectorFixed["uint" + bits] = readVectorFixedFactory(bits);
    BitConverter.writeVectorFixed["uint" + bits] = writeVectorFixedFactory(bits);
    BitConverter.readVectorVariable["uint" + bits] = readVectorVariableFactory(bits);
    BitConverter.writeVectorVariable["uint" + bits] = writeVectorVariableFactory(bits);
}
//# sourceMappingURL=BitConverter.js.map