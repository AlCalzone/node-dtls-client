"use strict";

export default class ChangeCipherSpec {
	constructor(type) {
		this.type = type; // ChangeCipherSpecTypes
	}
}

const /* uint8 */ ChangeCipherSpecTypes = {
	change_cipher_spec: 1,
};