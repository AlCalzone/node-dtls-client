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
var crypto = require("crypto");
var TLSStruct_1 = require("./TLSStruct");
var TypeSpecs = require("./TypeSpecs");
var Random = /** @class */ (function (_super) {
    __extends(Random, _super);
    function Random(gmt_unix_time, random_bytes) {
        var _this = _super.call(this, Random.__spec) || this;
        _this.gmt_unix_time = gmt_unix_time;
        _this.random_bytes = random_bytes;
        return _this;
    }
    /**
     * Creates a new Random structure and initializes it.
     */
    Random.createNew = function () {
        return new Random(Math.floor(Date.now() / 1000), crypto.randomBytes(Random.__spec.random_bytes.maxLength));
    };
    Random.createEmpty = function () {
        return new Random(null, null);
    };
    Random.__spec = {
        gmt_unix_time: TypeSpecs.uint32,
        random_bytes: TypeSpecs.define.Buffer(28),
    };
    return Random;
}(TLSStruct_1.TLSStruct));
exports.Random = Random;
