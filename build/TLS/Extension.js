"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extension = exports.ExtensionType = void 0;
const TLSStruct_1 = require("./TLSStruct");
const TypeSpecs = __importStar(require("./TypeSpecs"));
var ExtensionType;
(function (ExtensionType) {
    ExtensionType[ExtensionType["signature_algorithms"] = 13] = "signature_algorithms";
})(ExtensionType || (exports.ExtensionType = ExtensionType = {}));
(function (ExtensionType) {
    ExtensionType.spec = TypeSpecs.define.Enum("uint16", ExtensionType);
})(ExtensionType || (exports.ExtensionType = ExtensionType = {}));
class Extension extends TLSStruct_1.TLSStruct {
    extension_type;
    extension_data;
    static __spec = {
        extension_type: ExtensionType.spec,
        extension_data: TypeSpecs.define.Buffer(0, 2 ** 16 - 1),
    };
    static spec = TypeSpecs.define.Struct(Extension);
    constructor(extension_type, extension_data) {
        super(Extension.__spec);
        this.extension_type = extension_type;
        this.extension_data = extension_data;
    }
    static createEmpty() {
        return new Extension(null, null);
    }
}
exports.Extension = Extension;
