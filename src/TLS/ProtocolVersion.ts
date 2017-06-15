import { TLSStruct } from "./TLSStruct";
import * as TLSTypes from "./TLSTypes";

// TLS -> Anpassen für DTLS!!!

export class ProtocolVersion extends TLSStruct {

	static readonly __spec = {
		major: "uint8",
		minor: "uint8"
	};

	/**
	 * 
	 * @param major - Hauptversionsnummer
	 * @param minor - Nebenversionsnummer
	 */
	constructor(public major = 0, public minor = 0) {
		super(ProtocolVersion.__spec);
	}

} 