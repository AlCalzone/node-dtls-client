import { TLSStruct } from "./TLSStruct";
import * as TypeSpecs from "./TypeSpecs";

export enum AlertLevel {
	warning = 1,
	fatal = 2,
}

export enum AlertDescription {
	close_notify = 0,
	unexpected_message = 10,
	bad_record_mac = 20,
	decryption_failed_RESERVED = 21,
	record_overflow = 22,
	decompression_failure = 30,
	handshake_failure = 40,
	no_certificate_RESERVED = 41,
	bad_certificate = 42,
	unsupported_certificate = 43,
	certificate_revoked = 44,
	certificate_expired = 45,
	certificate_unknown = 46,
	illegal_parameter = 47,
	unknown_ca = 48,
	access_denied = 49,
	decode_error = 50,
	decrypt_error = 51,
	export_restriction_RESERVED = 60,
	protocol_version = 70,
	insufficient_security = 71,
	internal_error = 80,
	user_canceled = 90,
	no_renegotiation = 100,
	unsupported_extension = 110,
	certificate_unobtainable_RESERVED = 111,
	unrecognized_name = 112,
	bad_certificate_status_response = 113,
	bad_certificate_hash_value_RESERVED = 114,
	unknown_psk_identity = 115,
	certificate_required = 116,
	no_application_protocol = 120,
}

export class Alert extends TLSStruct {

	public static readonly __spec = {
		level: TypeSpecs.define.Enum("uint8", AlertLevel),
		description: TypeSpecs.define.Enum("uint8", AlertDescription),
	};
	public static readonly spec = TypeSpecs.define.Struct(Alert);

	constructor(public level: AlertLevel, public description: AlertDescription) {
		super(Alert.__spec);
	}

	public static createEmpty(): Alert {
		return new Alert(0, 0);
	}

}
