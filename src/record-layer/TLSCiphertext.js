"use strict";

export default class TLSCiphertext {
	constructor(type, version, length, fragment) {
		this.type = type; // ContentType
		this.version = version; // ProtocolVersion
		this.length = length; // uint16
		this.fragment = fragment; // <XXX>Ciphertext
	}
}