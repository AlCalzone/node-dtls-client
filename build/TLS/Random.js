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
var TLSStruct_1 = require("./TLSStruct");
var Random = (function (_super) {
    __extends(Random, _super);
    function Random() {
        return _super.call(this, Random.__spec) || this;
    }
    return Random;
}(TLSStruct_1.TLSStruct));
Random.__spec = {
    gmt_unix_time: TypeSpecs.define.Number("uint32"),
    random_bytes: TypeSpecs.define.Vector(TypeSpecs.define.Number("uint8"), 28)
};
exports.Random = Random;
//# sourceMappingURL=Random.js.map