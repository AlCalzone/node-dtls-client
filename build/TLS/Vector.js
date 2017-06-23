"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TypeSpecs = require("./TypeSpecs");
var util_1 = require("../lib/util");
var BitConverter_1 = require("../lib/BitConverter");
var Vector = (function (_super) {
    __extends(Vector, _super);
    function Vector(source, spec) {
        var _this = _super.apply(this, source) || this;
        _this.spec = spec;
        return _this;
    }
    Object.defineProperty(Vector.prototype, "isVariableLength", {
        get: function () {
            return this.spec.maxLength !== this.spec.minLength;
        },
        enumerable: true,
        configurable: true
    });
    Vector.prototype.serialize = function () {
        // optional, empty vectors resolve to empty buffers
        if (this.length === 0 && this.spec.optional) {
            return Buffer.allocUnsafe(0);
        }
        // serialize all the items into single buffers
        var serializedItems, bitSize;
        ;
        switch (this.spec.itemSpec.type) {
            case "number":
            case "enum":
                bitSize = TypeSpecs.getPrimitiveSize(this.spec.itemSpec);
                //+(this.spec.itemSpec as (TypeSpecs.Number | TypeSpecs.Enum)).size.substr("uint".length) as BitSizes;
                serializedItems = this.map(function (v) { return BitConverter_1.numberToBuffer(v, bitSize); });
                break;
            case "struct":
                serializedItems = this.map(function (v) { return v.serialize(); });
        }
        var ret = Buffer.concat(serializedItems);
        // for variable length vectors, prepend the maximum length
        if (this.isVariableLength) {
            var lengthBits = (8 * util_1.fitToWholeBytes(this.spec.maxLength));
            ret = Buffer.concat([
                BitConverter_1.numberToBuffer(ret.length, lengthBits),
                ret
            ]);
        }
        return ret;
    };
    Vector.prototype.deserialize = function (buf, offset) {
        if (offset === void 0) { offset = 0; }
        // for variable length vectors, read the length first
        var length = this.spec.maxLength;
        var delta = 0;
        if (this.isVariableLength) {
            var lengthBits = (8 * util_1.fitToWholeBytes(this.spec.maxLength));
            length = BitConverter_1.bufferToNumber(buf, lengthBits);
            delta += lengthBits / 8;
        }
        switch (this.spec.itemSpec.type) {
            case "number":
            case "enum":
                var bitSize = TypeSpecs.getPrimitiveSize(this.spec.itemSpec);
                for (var i_1 = 0; i_1 < length; i_1 += bitSize / 8) {
                    this.push(BitConverter_1.bufferToNumber(buf, bitSize, delta)); // we know this is a number!
                    delta += bitSize / 8;
                }
                break;
            case "struct":
                var i = 0;
                while (i < length) {
                    var item = this.spec.itemSpec.structType.from(this.spec.itemSpec, buf, offset + i);
                    i += item.readBytes;
                    this.push(item.result); // we know this is a struct/ISerializable
                }
        }
        return delta;
    };
    Vector.from = function (spec, buf, offset) {
        var ret = new Vector([], spec);
        if (buf.length === 0) {
            if (spec.optional)
                return { result: ret, readBytes: 0 };
            throw new Error("nothing to deserialize");
        }
        else {
            return { result: ret, readBytes: ret.deserialize(buf) };
        }
    };
    return Vector;
}(Array));
exports.Vector = Vector;
//# sourceMappingURL=Vector.js.map