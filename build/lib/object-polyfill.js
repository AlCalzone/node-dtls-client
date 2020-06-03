"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extend = exports.filter = exports.values = exports.entries = void 0;
function entries(obj) {
    return Object.keys(obj)
        .map(key => [key, obj[key]]);
}
exports.entries = entries;
function values(obj) {
    return Object.keys(obj)
        .map(key => obj[key]);
}
exports.values = values;
function filter(obj, predicate) {
    const ret = {};
    for (const [key, val] of entries(obj)) {
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
    for (const [prop, val] of entries(source)) {
        if (val instanceof Object) {
            // @ts-ignore This works, too much hassle to satisfy TS 3.5+
            target[prop] = extend(target[prop], val);
        }
        else {
            // @ts-ignore This works, too much hassle to satisfy TS 3.5+
            target[prop] = val;
        }
    }
    return target;
}
exports.extend = extend;
