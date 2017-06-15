"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TLSTypes = require("./TLSTypes");
var TLSStruct_1 = require("./TLSStruct");
var Random = (function (_super) {
    __extends(Random, _super);
    function Random() {
        return _super.call(this, Random.__spec) || this;
    }
    return Random;
}(TLSStruct_1.TLSStruct));
Random.__spec = {
    gmt_unix_time: "uint32",
    random_bytes: new TLSTypes.Vector("uint8", 28)
};
exports.Random = Random;
//# sourceMappingURL=Random.js.map