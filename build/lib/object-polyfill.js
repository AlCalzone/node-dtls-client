"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entries = entries;
exports.values = values;
exports.filter = filter;
exports.extend = extend;
function entries(obj) {
    return Object.keys(obj)
        .map(key => [key, obj[key]]);
}
function values(obj) {
    return Object.keys(obj)
        .map(key => obj[key]);
}
function filter(obj, predicate) {
    const ret = {};
    for (const [key, val] of entries(obj)) {
        if (predicate(val))
            ret[key] = val;
    }
    return ret;
}
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
