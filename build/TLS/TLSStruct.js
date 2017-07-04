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
     * Deserialisiert die Eigenschaften dieses Objekts aus dem angegebenen Buffer
     * @param buf - Der Buffer, aus dem gelesen werden soll
     * @param offset - Der Index, ab dem gelesen werden soll
     */
    TLSStruct.prototype.deserialize = function (buf, offset) {
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
                    result = { result: BitConverter_1.bufferToNumber(buf, bitSize, offset + delta), readBytes: bitSize / 8 };
                    break;
                case "vector":
                    result = Vector_1.Vector.from(type, buf, offset + delta);
                    break;
                case "struct":
                    result = type.structType.from(type, buf, offset + delta);
                    break;
                case "buffer":
                    // copy the remaining bytes
                    var ret = Buffer.allocUnsafe(buf.length - (offset + delta));
                    buf.copy(ret, 0, offset + delta);
                    result = { result: ret, readBytes: ret.length };
                    break;
            }
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
    TLSStruct.from = function (spec, buf, offset) {
        var ret = spec.structType.createEmpty();
        return { result: ret, readBytes: ret.deserialize(buf, offset) };
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
                    // we know propValue is a Vector<T> but we don't know or care about T
                    return propValue.serialize(type);
                case "struct":
                    return propValue.serialize();
                case "buffer":
                    return propValue;
            }
        });
        return Buffer.concat(ret);
    };
    return TLSStruct;
}());
exports.TLSStruct = TLSStruct;
//# sourceMappingURL=TLSStruct.js.map