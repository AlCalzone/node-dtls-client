import { expect } from "chai";

import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";

const testSpec = {
	enum: new TLSTypes.Enum("uint16", "doesn't matter"),
	number: "uint8",
	vectorF: new TLSTypes.Vector("uint32", 2, 2),
	vectorV: new TLSTypes.Vector("uint24", 0, 4),
};

const nestedSpec = {
	nested: new TLSTypes.Struct({ property: "uint8" })
};
const testMessage1 = new TLSStruct(testSpec, {
	enum: 0xFFFE,
	number: 0xAA,
	vectorF: [0x12345678, 0xDDCCBBAA],
	vectorV: []
});

describe('Message tests =>', () => {
	it('constructor', function () {
		expect(testMessage1["enum"]).to.be.equal(0xFFFE, "Eigenschaft stimmt nicht überein: 'enum'");
		expect(testMessage1["number"]).to.be.equal(0xAA, "Eigenschaft stimmt nicht überein: 'number'");
		expect(testMessage1["vectorF"]).to.deep.equal([0x12345678, 0xDDCCBBAA], "Eigenschaft stimmt nicht überein: 'vectorF'");
		expect(testMessage1["vectorV"]).to.deep.equal([], "Eigenschaft stimmt nicht überein: 'vectorV'");
	});

	const rawMessage1 = testMessage1.serialize();

	it('serialize 1', () => {
		const expected = Buffer.from([
			0xFF, 0xFE, 0xAA, 0x12, 0x34, 0x56, 0x78, 0xDD, 0xCC, 0xBB, 0xAA, 0
		]);
		expect(rawMessage1).to.deep.equal(expected, "Daten stimmen nicht überein");
	});

	it('deserialize 1', () => {
		const msg = TLSStruct.from(testSpec, rawMessage1);
		for (let property of ["enum", "number"]) {
			expect(testMessage1[property]).to.be.equal(msg[property], `Eigenschaft stimmt nicht überein: ${property}`);
		}
		for (let property of ["vectorF", "vectorV"]) {
			expect(testMessage1[property]).to.deep.equal(msg[property], `Eigenschaft stimmt nicht überein: ${property}`);
		}
	});

	it('deserialize 2', () => {
		const testMessage2 = new TLSStruct(testSpec, {
			enum: 0xAAAA,
			number: 0xBB,
			vectorF: [0x87654321, 0x01234567],
			vectorV: [0xAAAAAA, 0xBBBBBB, 0xCCDDEE]
		});
		const rawMessage2 = Buffer.from([
			0xAA, 0xAA, 0xBB, 0x87, 0x65, 0x43, 0x21, 0x01, 0x23, 0x45, 0x67, 9, 0xAA, 0xAA, 0xAA, 0xBB, 0xBB, 0xBB, 0xCC, 0xDD, 0xEE
		]);
		const msg = TLSStruct.from(testSpec, rawMessage2);
		for (let property of ["enum", "number"]) {
			expect(testMessage2[property]).to.be.equal(msg[property], `Eigenschaft stimmt nicht überein: ${property}`);
		}
		for (let property of ["vectorF", "vectorV"]) {
			expect(testMessage2[property]).to.deep.equal(msg[property], `Eigenschaft stimmt nicht überein: ${property}`);
		}
	});

	it('deserialize 3', () => {
		const testMessage2 = new TLSStruct(testSpec, {
			enum: 0xAAAA,
			number: 0xBB,
			vectorF: [0x87654321, 0x01234567],
			vectorV: [0xAAAAAA, 0xBBBBBB, 0xCCDDEE]
		});
		const rawMessage2 = Buffer.from([
			0, 0xAA, 0xAA, 0xBB, 0x87, 0x65, 0x43, 0x21, 0x01, 0x23, 0x45, 0x67, 9, 0xAA, 0xAA, 0xAA, 0xBB, 0xBB, 0xBB, 0xCC, 0xDD, 0xEE, 0
		]);
		const msg = TLSStruct.from(testSpec, rawMessage2, 1);
		for (let property of ["enum", "number"]) {
			expect(testMessage2[property]).to.be.equal(msg[property], `Eigenschaft stimmt nicht überein: ${property}`);
		}
		for (let property of ["vectorF", "vectorV"]) {
			expect(testMessage2[property]).to.deep.equal(msg[property], `Eigenschaft stimmt nicht überein: ${property}`);
		}
	});

	it('vector alternative constructor', () => {
		const V = new TLSTypes.Vector("uint8", 2);
		expect(V.maxLength).to.be.equal(2)
			.and.to.be.equal(V.minLength);
	});

	it('nested struct serialize', () => {
		const testMessage = new TLSStruct(nestedSpec, {
			nested: new TLSStruct(nestedSpec.nested.spec, { property: 5 })
		});
		expect(testMessage.serialize()).to.deep.equal(Buffer.from([5]));
	});

	it('nested struct deserialize', () => {
		const testMessage = TLSStruct.from(nestedSpec, Buffer.from([5])) as any;
		expect(testMessage).
			to.have.ownProperty("nested");
		expect(testMessage.nested).
			to.have.ownProperty("property");
		expect(testMessage.nested.property).
			to.equal(5);

	});

	it('unknown type deserialize', () => {
		const faultySpec = {
			stuff: 6
		};
		expect(
			TLSStruct.from.bind(TLSStruct, faultySpec, Buffer.from([0]))
		).to.throw(TypeError);
	});

	it('unknown type serialize', () => {
		const faultySpec = {
			stuff: 6
		};
		const faultyObj = new TLSStruct(faultySpec) as any;
		faultyObj.stuff = 0;

		expect(
			faultyObj.serialize.bind(faultyObj)
		).to.throw(TypeError);
	});

});