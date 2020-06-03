"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeCipherSpec = exports.ChangeCipherSpecTypes = void 0;
const TLSStruct_1 = require("./TLSStruct");
const TypeSpecs = require("./TypeSpecs");
var ChangeCipherSpecTypes;
(function (ChangeCipherSpecTypes) {
    ChangeCipherSpecTypes[ChangeCipherSpecTypes["change_cipher_spec"] = 1] = "change_cipher_spec";
})(ChangeCipherSpecTypes = exports.ChangeCipherSpecTypes || (exports.ChangeCipherSpecTypes = {}));
(function (ChangeCipherSpecTypes) {
    ChangeCipherSpecTypes.__spec = TypeSpecs.define.Enum("uint8", ChangeCipherSpecTypes);
})(ChangeCipherSpecTypes = exports.ChangeCipherSpecTypes || (exports.ChangeCipherSpecTypes = {}));
let ChangeCipherSpec = /** @class */ (() => {
    class ChangeCipherSpec extends TLSStruct_1.TLSStruct {
        constructor(type) {
            super(ChangeCipherSpec.__spec);
            this.type = type;
        }
        static createEmpty() {
            return new ChangeCipherSpec(ChangeCipherSpecTypes.change_cipher_spec);
        }
    }
    ChangeCipherSpec.__spec = {
        type: TypeSpecs.define.Enum("uint8", ChangeCipherSpec),
    };
    return ChangeCipherSpec;
})();
exports.ChangeCipherSpec = ChangeCipherSpec;
