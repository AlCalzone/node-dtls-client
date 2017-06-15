"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TLSTypes = require("../lib/TLSTypes");
var TLSStruct_1 = require("../lib/TLSStruct");
var SessionID = (function (_super) {
    __extends(SessionID, _super);
    function SessionID(value) {
        if (value === void 0) { value = []; }
        var _this = _super.call(this, SessionID.__spec) || this;
        _this.value = value;
        return _this;
    }
    return SessionID;
}(TLSStruct_1.TLSStruct));
SessionID.__spec = {
    value: new TLSTypes.Vector("uint8", 0, 32)
};
exports.SessionID = SessionID;
//# sourceMappingURL=SessionID.js.map