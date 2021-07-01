"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alert = exports.AlertDescription = exports.AlertLevel = void 0;
const TLSStruct_1 = require("./TLSStruct");
const TypeSpecs = require("./TypeSpecs");
var AlertLevel;
(function (AlertLevel) {
    AlertLevel[AlertLevel["warning"] = 1] = "warning";
    AlertLevel[AlertLevel["fatal"] = 2] = "fatal";
})(AlertLevel = exports.AlertLevel || (exports.AlertLevel = {}));
var AlertDescription;
(function (AlertDescription) {
    AlertDescription[AlertDescription["close_notify"] = 0] = "close_notify";
    AlertDescription[AlertDescription["unexpected_message"] = 10] = "unexpected_message";
    AlertDescription[AlertDescription["bad_record_mac"] = 20] = "bad_record_mac";
    AlertDescription[AlertDescription["decryption_failed_RESERVED"] = 21] = "decryption_failed_RESERVED";
    AlertDescription[AlertDescription["record_overflow"] = 22] = "record_overflow";
    AlertDescription[AlertDescription["decompression_failure"] = 30] = "decompression_failure";
    AlertDescription[AlertDescription["handshake_failure"] = 40] = "handshake_failure";
    AlertDescription[AlertDescription["no_certificate_RESERVED"] = 41] = "no_certificate_RESERVED";
    AlertDescription[AlertDescription["bad_certificate"] = 42] = "bad_certificate";
    AlertDescription[AlertDescription["unsupported_certificate"] = 43] = "unsupported_certificate";
    AlertDescription[AlertDescription["certificate_revoked"] = 44] = "certificate_revoked";
    AlertDescription[AlertDescription["certificate_expired"] = 45] = "certificate_expired";
    AlertDescription[AlertDescription["certificate_unknown"] = 46] = "certificate_unknown";
    AlertDescription[AlertDescription["illegal_parameter"] = 47] = "illegal_parameter";
    AlertDescription[AlertDescription["unknown_ca"] = 48] = "unknown_ca";
    AlertDescription[AlertDescription["access_denied"] = 49] = "access_denied";
    AlertDescription[AlertDescription["decode_error"] = 50] = "decode_error";
    AlertDescription[AlertDescription["decrypt_error"] = 51] = "decrypt_error";
    AlertDescription[AlertDescription["export_restriction_RESERVED"] = 60] = "export_restriction_RESERVED";
    AlertDescription[AlertDescription["protocol_version"] = 70] = "protocol_version";
    AlertDescription[AlertDescription["insufficient_security"] = 71] = "insufficient_security";
    AlertDescription[AlertDescription["internal_error"] = 80] = "internal_error";
    AlertDescription[AlertDescription["user_canceled"] = 90] = "user_canceled";
    AlertDescription[AlertDescription["no_renegotiation"] = 100] = "no_renegotiation";
    AlertDescription[AlertDescription["unsupported_extension"] = 110] = "unsupported_extension";
    AlertDescription[AlertDescription["certificate_unobtainable_RESERVED"] = 111] = "certificate_unobtainable_RESERVED";
    AlertDescription[AlertDescription["unrecognized_name"] = 112] = "unrecognized_name";
    AlertDescription[AlertDescription["bad_certificate_status_response"] = 113] = "bad_certificate_status_response";
    AlertDescription[AlertDescription["bad_certificate_hash_value_RESERVED"] = 114] = "bad_certificate_hash_value_RESERVED";
    AlertDescription[AlertDescription["unknown_psk_identity"] = 115] = "unknown_psk_identity";
    AlertDescription[AlertDescription["certificate_required"] = 116] = "certificate_required";
    AlertDescription[AlertDescription["no_application_protocol"] = 120] = "no_application_protocol";
})(AlertDescription = exports.AlertDescription || (exports.AlertDescription = {}));
class Alert extends TLSStruct_1.TLSStruct {
    constructor(level, description) {
        super(Alert.__spec);
        this.level = level;
        this.description = description;
    }
    static createEmpty() {
        return new Alert(0, 0);
    }
}
exports.Alert = Alert;
Alert.__spec = {
    level: TypeSpecs.define.Enum("uint8", AlertLevel),
    description: TypeSpecs.define.Enum("uint8", AlertDescription),
};
Alert.spec = TypeSpecs.define.Struct(Alert);
