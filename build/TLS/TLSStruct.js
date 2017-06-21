"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var object_polyfill_1 = require("../lib/object-polyfill");
var BitConverter = require("../lib/BitConverter");
var TLSTypes = require("./TLSTypes");
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
            var propName = def.name, type = def.type;
            var result = void 0;
            // Typ ermitteln
            if (typeof type === "string") {
                // Basistyp (Zahl)
                result = BitConverter.readNumber[type](arr, offset + delta);
            }
            else if (type instanceof TLSTypes.Enum) {
                // Enum
                result = BitConverter.readNumber[type.underlyingType](arr, offset + delta);
            }
            else if (type instanceof TLSTypes.Vector) {
                // Vektor (variable oder fixed)
                if (type.optional && offset + delta >= arr.length) {
                    // Optionaler Vektor:
                    // Wir sind am Ende, keine weiteren Werte lesen
                    result = { value: [], delta: 0 };
                }
                else {
                    if (type.minLength === type.maxLength) {
                        result = BitConverter.readVectorFixed[type.underlyingType](type.maxLength, arr, offset + delta);
                    }
                    else {
                        result = BitConverter.readVectorVariable[type.underlyingType](type.maxLength, arr, offset + delta);
                    }
                }
            }
            else if (type instanceof TLSTypes.Struct) {
                // Zusammengesetzter Typ
                result = TLSStruct._from(type.spec, arr, offset + delta);
            }
            else {
                throw new TypeError("unknown message type specified");
            }
            // Wert merken und im Array voranschreiten
            this[propName] = result.value;
            delta += result.delta;
        }
        return { value: this, delta: delta };
    };
    /**
     * Erzeugt eine TLSStruct der angegebenen Definition aus einem Byte-Array
     * @param spec - Definiert, wie das deserialisierte Objekt aufgebaut ist
     * @param arr - Das Array, aus dem gelesen werden soll
     * @param offset - Der Index, ab dem gelesen werden soll
     */
    TLSStruct.from = function (spec, arr, offset) {
        return TLSStruct._from(spec, arr, offset).value;
    };
    TLSStruct._from = function (spec, arr, offset) {
        var ret = new TLSStruct(spec);
        return ret.deserialize(arr, offset);
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
            var result;
            // Typ ermitteln
            if (typeof type === "string") {
                // Basistyp (Zahl)
                result = BitConverter.writeNumber[type](propValue);
            }
            else if (type instanceof TLSTypes.Enum) {
                // Enum
                result = BitConverter.writeNumber[type.underlyingType](propValue);
            }
            else if (type instanceof TLSTypes.Vector) {
                // Optionale Vektoren nur schreiben, wenn länger als 0
                if (type.optional && propValue.length === 0)
                    return Buffer.from([]);
                // Vektor (variabel oder fixed)
                if (type.minLength === type.maxLength) {
                    result = BitConverter.writeVectorFixed[type.underlyingType](propValue);
                }
                else {
                    result = BitConverter.writeVectorVariable[type.underlyingType](propValue, type.maxLength);
                }
            }
            else if (type instanceof TLSTypes.Struct) {
                // Zusammengesetzter Typ
                return propValue.serialize();
            }
            else {
                throw new TypeError("unknown message type specified");
            }
            return result.value;
        });
        return Buffer.concat(ret);
        //.reduce((prev, cur) => prev.concat(cur), [])
        //;
    };
    return TLSStruct;
}());
exports.TLSStruct = TLSStruct;
//# sourceMappingURL=TLSStruct.js.map