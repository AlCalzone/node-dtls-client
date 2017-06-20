"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TLSTypes = require("./TLSTypes");
var ContentType;
(function (ContentType) {
    ContentType[ContentType["change_cipher_spec"] = 20] = "change_cipher_spec";
    ContentType[ContentType["alert"] = 21] = "alert";
    ContentType[ContentType["handshake"] = 22] = "handshake";
    ContentType[ContentType["application_data"] = 23] = "application_data";
})(ContentType = exports.ContentType || (exports.ContentType = {}));
(function (ContentType) {
    ContentType.__spec = new TLSTypes.Enum("uint8", ContentType);
})(ContentType = exports.ContentType || (exports.ContentType = {}));
//# sourceMappingURL=ContentType.js.map