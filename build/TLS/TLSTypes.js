"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Shortcuts:
exports.make = (_a = {},
    _a["enum"] = function (size, enumType) { return ({ type: "enum", size: size, enumType: enumType }); },
    _a.number = function (size) { return ({ type: "number", size: size }); },
    _a.struct = function (spec) { return ({ type: "struct", spec: spec }); },
    _a.vector = function (itemType, minLength, maxLength, optional) {
        if (minLength === void 0) { minLength = 0; }
        if (maxLength === void 0) { maxLength = minLength; }
        if (optional === void 0) { optional = false; }
        return ({
            type: "vector",
            itemType: itemType,
            minLength: minLength, maxLength: maxLength,
            optional: optional
        });
    },
    _a);
var _a;
//# sourceMappingURL=TLSTypes.js.map