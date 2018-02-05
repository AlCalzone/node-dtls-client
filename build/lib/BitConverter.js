"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function numberToBuffer(value, size) {
    var n = size / 8;
    var ret = Buffer.alloc(n);
    for (var i = n - 1; i >= 0; i--) {
        ret[i] = value & 0xff;
        value >>>= 8;
    }
    return ret;
}
exports.numberToBuffer = numberToBuffer;
function bufferToNumber(buf, size, offset) {
    if (offset === void 0) { offset = 0; }
    var ret = 0;
    var n = size / 8;
    for (var i = 0; i < n; i++) {
        ret = ret * 256 + buf[i + offset];
    }
    return ret;
}
exports.bufferToNumber = bufferToNumber;
function bufferToByteArray(buf, offset) {
    if (offset === void 0) { offset = 0; }
    return Array.prototype.slice.apply(buf, [offset]);
}
exports.bufferToByteArray = bufferToByteArray;
