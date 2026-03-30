"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberToBuffer = numberToBuffer;
exports.bufferToNumber = bufferToNumber;
exports.bufferToByteArray = bufferToByteArray;
function numberToBuffer(value, size) {
    const n = size / 8;
    const ret = Buffer.alloc(n);
    for (let i = n - 1; i >= 0; i--) {
        ret[i] = value & 0xff;
        value >>>= 8;
    }
    return ret;
}
function bufferToNumber(buf, size, offset = 0) {
    let ret = 0;
    const n = size / 8;
    for (let i = 0; i < n; i++) {
        ret = ret * 256 + buf[i + offset];
    }
    return ret;
}
function bufferToByteArray(buf, offset = 0) {
    return Array.prototype.slice.apply(buf, [offset]);
}
