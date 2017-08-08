"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Stellt einen Polyfill für Object.entries bereit
 * @param obj - Ein Objekt über dessen Einträge iteriert werden soll
 */
function entries(obj) {
    return Object.keys(obj)
        .map(function (key) { return [key, obj[key]]; });
}
exports.entries = entries;
// ES6-Generator-Version
// export function* entries(obj) {
// 	for (let key of Object.keys(obj)) {
// 		yield [key, obj[key]];
// 	}
// }
/**
 * Stellt einen Polyfill für Object.entries bereit
 * @param obj - Ein Objekt über dessen Werte iteriert werden soll
 */
function values(obj) {
    return Object.keys(obj)
        .map(function (key) { return obj[key]; });
}
exports.values = values;
function filter(obj, predicate) {
    var ret = {};
    for (var _i = 0, _a = entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], val = _b[1];
        if (predicate(val, key))
            ret[key] = val;
    }
    return ret;
}
exports.filter = filter;
/**
 * Kombinierte mehrere Key-Value-Paare zu einem Objekt
 * @param properties - Die einzelnen Eigenschaften des zu kombinierenden Objekts als Key-Wert-Paare
 */
function composeObject(properties) {
    return properties.reduce(function (acc, _a) {
        var key = _a[0], value = _a[1];
        acc[key] = value;
        return acc;
    }, {});
}
exports.composeObject = composeObject;
/**
 * Extrahiert eine Eigenschaft aus einer Objektstruktur anhand eines Property-Pfades
 * @param object - Die Objektstruktur in der die Eigenschaft gesucht werden soll
 * @param path - Der Eigenschaftspfad der Form propName.propName.[arrayIndex].propName
 */
function dig(object, path) {
    function _dig(obj, pathArr) {
        // are we there yet? then return obj
        if (!pathArr.length)
            return obj;
        // go deeper
        var propName = pathArr.shift();
        if (/\[\d+\]/.test(propName)) {
            // this is an array index
            propName = +propName.slice(1, -1);
        }
        return _dig(obj[propName], pathArr);
    }
    return _dig(object, path.split("."));
}
exports.dig = dig;
/**
 * Vergräbt eine Eigenschaft in einem Objekt (Gegenteil von dig)
 * @param object - Die Objektstruktur in der die Eigenschaft abgelegt werden soll
 * @param path - Der Eigenschaftspfad der Form propName.propName.[arrayIndex].propName
 * @param value - Der abzulegende Eigenschaftswert
 */
function bury(object, path, value) {
    function _bury(obj, pathArr) {
        // are we there yet? then return obj
        if (pathArr.length === 1) {
            obj[pathArr[0]] = value;
            return;
        }
        // go deeper
        var propName = pathArr.shift();
        if (/\[\d+\]/.test(propName)) {
            // this is an array index
            propName = +propName.slice(1, -1);
        }
        _bury(obj[propName], pathArr);
    }
    _bury(object, path.split("."));
}
exports.bury = bury;
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
//# sourceMappingURL=object-polyfill.js.map