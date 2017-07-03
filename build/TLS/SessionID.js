"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TypeSpecs = require("./TypeSpecs");
var Vector_1 = require("../TLS/Vector");
var SessionID;
(function (SessionID) {
    SessionID.spec = TypeSpecs.define.Vector(TypeSpecs.uint8, 0, 32);
    function create(items) {
        if (items === void 0) { items = []; }
        return new Vector_1.Vector(SessionID.spec, items);
    }
    SessionID.create = create;
})(SessionID = exports.SessionID || (exports.SessionID = {}));
//# sourceMappingURL=SessionID.js.map