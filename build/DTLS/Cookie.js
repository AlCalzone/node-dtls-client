"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cookie = void 0;
const TypeSpecs = require("../TLS/TypeSpecs");
var Cookie;
(function (Cookie) {
    Cookie.spec = TypeSpecs.define.Buffer(0, Math.pow(2, 8) - 1);
})(Cookie = exports.Cookie || (exports.Cookie = {}));
