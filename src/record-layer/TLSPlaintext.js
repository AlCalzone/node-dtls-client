"use strict";

import ProtocolVersion from "./ProtocolVersion";

export default class TLSPlaintext {
	constructor() {
		this.type = 0; // ContentType
		this.version = new ProtocolVersion(3, 3)
		this.length = 0; // uint16
		this.fragment = []; // variable length;
	}
}