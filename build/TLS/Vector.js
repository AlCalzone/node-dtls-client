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
var Vector = (function (_super) {
    __extends(Vector, _super);
    function Vector(source, minLength, maxLength, optional) {
        if (minLength === void 0) { minLength = 0; }
        if (maxLength === void 0) { maxLength = minLength; }
        if (optional === void 0) { optional = false; }
        var _this = _super.apply(this, source) || this;
        _this.minLength = minLength;
        _this.maxLength = maxLength;
        _this.optional = optional;
        return _this;
    }
    Object.defineProperty(Vector.prototype, "isVariableLength", {
        get: function () {
            return this.maxLength !== this.minLength;
        },
        enumerable: true,
        configurable: true
    });
    Vector.prototype.serialize = function () {
        // optional, empty vectors resolve to empty buffers
        if (this.length === 0 && this.optional) {
            return Buffer.allocUnsafe(0);
        }
        // for variable length
        var x = this[0];
        if (typeof x === "number") {
        }
        else {
            var y = x;
        }
        throw new Error('Method not implemented.');
    };
    Vector.prototype.deserialize = function (buf, offset) {
        throw new Error('Method not implemented.');
    };
    return Vector;
}(Array));
exports.Vector = Vector;
//# sourceMappingURL=Vector.js.map