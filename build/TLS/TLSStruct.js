"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var object_polyfill_1 = require("../lib/object-polyfill");
var BitConverter_1 = require("../lib/BitConverter");
var TypeSpecs = require("./TypeSpecs");
var Vector_1 = require("./Vector");
/**
 * Basisklasse für TLS-Objekte
 */
var TLSStruct = (function () {
    function TLSStruct(spec, initial) {
        this.propertyDefinitions = [];
        // Eigenschaften aus Spec kopieren
        this.__spec__ = spec;
        for (var _i = 0, _a = object_polyfill_1.entries(spec); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
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
    /**
     * Deserialisiert die Eigenschaften dieses Objekts aus dem angegebenen Byte-Array
     * @param arr - Das Array, aus dem gelesen werden soll
     * @param offset - Der Index, ab dem gelesen werden soll
     */
    TLSStruct.prototype.deserialize = function (arr, offset) {
        if (offset === void 0) { offset = 0; }
        var delta = 0;
        for (var _i = 0, _a = this.propertyDefinitions; _i < _a.length; _i++) {
            var def = _a[_i];
            // Welche Eigenschaft wird ausgelesen?
            var propName = def.name, type = def.type, result = void 0;
            switch (type.type) {
                case "number":
                case "enum":
                    var bitSize = TypeSpecs.getPrimitiveSize(type);
                    result = { result: BitConverter_1.bufferToNumber(arr, bitSize, offset + delta), readBytes: bitSize / 8 };
                    break;
                case "vector":
                    result = Vector_1.Vector.from(type, arr, offset + delta);
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
    };
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
    TLSStruct.from = function (spec, buf, offset) {
        var ret = new spec.structType(spec.spec);
        return { result: ret, readBytes: ret.deserialize(buf) };
    };
    /**
     * Serialisiert das Objekt in ein ein Byte-Array
     */
    TLSStruct.prototype.serialize = function () {
        var _this = this;
        var ret = this.propertyDefinitions
            .map(function (def) {
            // Welche Eigenschaft wird ausgelesen?
            var propName = def.name, type = def.type, propValue = _this[propName];
            switch (type.type) {
                case "number":
                case "enum":
                    var bitSize = TypeSpecs.getPrimitiveSize(type);
                    return BitConverter_1.numberToBuffer(propValue, bitSize);
                case "vector":
                case "struct":
                    return propValue.serialize(); // we know this must be an ISerializable
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
    };
    return TLSStruct;
}());
exports.TLSStruct = TLSStruct;
//# sourceMappingURL=TLSStruct.js.map