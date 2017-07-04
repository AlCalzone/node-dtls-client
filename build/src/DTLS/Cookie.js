"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TypeSpecs = require("../TLS/TypeSpecs");
var Vector_1 = require("../TLS/Vector");
var Cookie;
(function (Cookie) {
    Cookie.spec = TypeSpecs.define.Vector(TypeSpecs.uint8, 0, Math.pow(2, 8) - 1);
    function createNew(items) {
        if (items === void 0) { items = []; }
        return new Vector_1.Vector(items);
    }
    Cookie.createNew = createNew;
})(Cookie = exports.Cookie || (exports.Cookie = {}));
//# sourceMappingURL=Cookie.js.map