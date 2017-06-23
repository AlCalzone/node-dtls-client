"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* Calculates how many bytes are neccessary to express the given value
* @param value {number} - the value to be measured
* @returns {number}
*/
function fitToWholeBytes(value) {
    var ret = 0;
    while (value !== 0) {
        ret++;
        value >>= 8;
    }
    if (ret === 0)
        ret++;
    return ret;
}
exports.fitToWholeBytes = fitToWholeBytes;
/**
 * Provides a static implementation of an interface with static and prototype methods
 */
function staticImplements() {
    return function (constructor) { };
}
exports.staticImplements = staticImplements;
//# sourceMappingURL=util.js.map