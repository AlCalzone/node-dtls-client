"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BitConverter_1 = require("../lib/BitConverter");
var util_1 = require("../lib/util");
var TypeSpecs = require("./TypeSpecs");
var Vector = /** @class */ (function () {
    function Vector(items) {
        if (items === void 0) { items = []; }
        this.items = items;
    }
    Vector.prototype.serialize = function (spec) {
        // optional, empty vectors resolve to empty buffers
        if (this.items.length === 0 && spec.optional) {
            return Buffer.allocUnsafe(0);
        }
        // serialize all the items into single buffers
        var serializedItems;
        var bitSize;
        switch (spec.itemSpec.type) {
            case "number":
            case "enum":
                bitSize = TypeSpecs.getPrimitiveSize(spec.itemSpec);
                serializedItems = this.items.map(function (v) { return BitConverter_1.numberToBuffer(v, bitSize); });
                break;
            case "struct":
                serializedItems = this.items.map(function (v) { return v.serialize(); });
        }
        var ret = Buffer.concat(serializedItems);
        // for variable length vectors, prepend the maximum length
        if (TypeSpecs.Vector.isVariableLength(spec)) {
            var lengthBits = (8 * util_1.fitToWholeBytes(spec.maxLength));
            ret = Buffer.concat([
                BitConverter_1.numberToBuffer(ret.length, lengthBits),
                ret,
            ]);
        }
        return ret;
    };
    Vector.prototype.deserialize = function (spec, buf, offset) {
        if (offset === void 0) { offset = 0; }
        // for variable length vectors, read the length first
        var length = spec.maxLength;
        var delta = 0;
        if (TypeSpecs.Vector.isVariableLength(spec)) {
            var lengthBits = (8 * util_1.fitToWholeBytes(spec.maxLength));
            length = BitConverter_1.bufferToNumber(buf, lengthBits, offset);
            delta += lengthBits / 8;
        }
        var i;
        switch (spec.itemSpec.type) {
            case "number":
            case "enum":
                var bitSize = TypeSpecs.getPrimitiveSize(spec.itemSpec);
                for (i = 0; i < length; i += bitSize / 8) {
                    this.items.push(BitConverter_1.bufferToNumber(buf, bitSize, offset + delta)); // we know this is a number!
                    delta += bitSize / 8;
                }
                break;
            case "struct":
                i = 0;
                while (i < length) {
                    var item = spec.itemSpec.structType.from(spec.itemSpec, buf, offset + delta);
                    if (item.readBytes <= 0) {
                        // this shouldn't happen, but we don't want to introduce an infinite loop
                        throw new Error("Zero or less bytes read while parsing TLS struct.");
                    }
                    i += item.readBytes;
                    delta += item.readBytes;
                    this.items.push(item.result); // we know this is a struct/ISerializable
                }
        }
        return delta;
    };
    Vector.from = function (spec, buf, offset) {
        var ret = new Vector();
        if (buf.length === 0) {
            if (spec.optional)
                return { result: ret, readBytes: 0 };
            throw new Error("nothing to deserialize");
        }
        else {
            return { result: ret, readBytes: ret.deserialize(spec, buf, offset) };
        }
    };
    return Vector;
}());
exports.Vector = Vector;
