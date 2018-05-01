// tslint:disable:no-console
// tslint:disable:no-unused-expression
// tslint:disable:variable-name

import { assert, expect, should, use } from "chai";
import { spy, stub } from "sinon";
import * as sinonChai from "sinon-chai";

import { dtls } from "./dtls";

// enable the should interface with sinon
should();
// improve stubs for testing
use(sinonChai);

describe("dtls.createSocket() => ", () => {

	it("should throw when required properties on the options object are missing", () => {
		// valid options:
		// {type: "udp4", address: "localhost", port: 1234, psk: {}},
		const faultyOptions: {}[] = [
			null,
			{},
			// missing type
			{address: "localhost", port: 1234, psk: {}},
			// invalid type
			{type: "invalid", address: "localhost", port: 1234, psk: {}},
			// missing address
			{type: "udp4", port: 1234, psk: {}},
			// invalid address
			{type: "udp4", address: 1, port: 1234, psk: {}},
			// missing port
			{type: "udp4", address: "localhost", psk: {}},
			// invalid ports
			{type: "udp4", address: "localhost", port: "1234", psk: {}},
			{type: "udp4", address: "localhost", port: 0, psk: {}},
			{type: "udp4", address: "localhost", port: 65536, psk: {}},
			// missing PSK
			{type: "udp4", address: "localhost", port: 1234},
			// invalid PSK
			{type: "udp4", address: "localhost", port: 1234, psk: 123},
		];
		for (const opts of faultyOptions) {
			expect(() => dtls.createSocket(opts as dtls.Options)).to.throw("connection options");
		}
	});

});
