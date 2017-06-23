import { TLSStruct } from "./TLSStruct";
import * as TypeSpecs from "./TypeSpecs";

// TLS -> Anpassen für DTLS!!!

export class ProtocolVersion extends TLSStruct {

	static readonly __spec = {
		major: TypeSpecs.define.Number("uint8"),
		minor: TypeSpecs.define.Number("uint8")
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