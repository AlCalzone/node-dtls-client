"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function entries(obj) {
    return Object.keys(obj)
        .map(function (key) { return [key, obj[key]]; });
}
exports.entries = entries;
function values(obj) {
    return Object.keys(obj)
        .map(function (key) { return obj[key]; });
}
exports.values = values;
function filter(obj, predicate) {
    var ret = {};
    for (var _i = 0, _a = entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], val = _b[1];
        if (predicate(val))
            ret[key] = val;
    }
    return ret;
}
exports.filter = filter;
/**
 * Kopiert Eigenschaften rekursiv von einem Objekt auf ein anderes
 * @param target - Das Zielobjekt, auf das die Eigenschaften übertragen werden sollen
 * @param source - Das Quellobjekt, aus dem die Eigenschaften kopiert werden sollen
 */
function extend(target, source) {
    target = target || {};
    for (var _i = 0, _a = entries(source); _i < _a.length; _i++) {
        var _b = _a[_i], prop = _b[0], val = _b[1];
        if (val instanceof Object) {
            target[prop] = extend(target[prop], val);
        }
        else {
            target[prop] = val;
        }
    }
    return target;
}
exports.extend = extend;
