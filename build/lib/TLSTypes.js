"use strict";
var Enum = (function () {
    function Enum(underlyingType, enumType) {
        this.underlyingType = underlyingType;
        this.enumType = enumType;
    }
    return Enum;
}());
exports.Enum = Enum;
var Vector = (function () {
    function Vector(underlyingType, minLength, maxLength) {
        this.underlyingType = underlyingType;
        this.minLength = minLength;
        this.maxLength = maxLength || minLength;
    }
    return Vector;
}());
exports.Vector = Vector;
var Struct = (function () {
    function Struct(spec) {
        this.spec = spec;
    }
    return Struct;
}());
exports.Struct = Struct;
var Calculated = (function () {
    function Calculated(underlyingType, calculationType, propertyName) {
        this.underlyingType = underlyingType;
        this.calculationType = calculationType;
        this.propertyName = propertyName;
    }
    return Calculated;
}());
exports.Calculated = Calculated;
//# sourceMappingURL=TLSTypes.js.map