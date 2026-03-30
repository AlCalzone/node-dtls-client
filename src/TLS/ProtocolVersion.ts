import { TLSStruct } from "./TLSStruct.js";
import * as TypeSpecs from "./TypeSpecs.js";

// TLS -> Anpassen für DTLS!!!

export class ProtocolVersion extends TLSStruct {

	public static readonly __spec = {
		major: TypeSpecs.uint8,
		minor: TypeSpecs.uint8,
	};

	/**
	 *
	 * @param major - Hauptversionsnummer
	 * @param minor - Nebenversionsnummer
	 */
	constructor(public major = 0, public minor = 0) {
		super(ProtocolVersion.__spec);
	}

	public static createEmpty(): ProtocolVersion {
		return new ProtocolVersion();
	}

}
