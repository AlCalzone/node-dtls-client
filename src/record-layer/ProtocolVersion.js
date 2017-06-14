"use strict";

// TLS!!!

export default class ProtocolVersion {

	constructor(major, minor) {
		/* uint8 */ this.major = major;
		/* uint8 */ this.minor = minor;
	}

	serialize() {
		return [this.major, this.minor];
	}
	static deserialize(arr, offset = 0) {
		return new ProtocolVersion(
			arr[offset], arr[offset+1]
		);
	}
} 