var assert = require('assert');
var arrayEquals = require('./util').arrayEquals;

var msg = require('../build/lib/Message');
var Spec = msg.Spec,
	Message = msg.Message
	;

const testSpec = {
	enum: Spec.enum("uint16", "doesn't matter"),
	number: "uint8",
	vectorF: Spec.vector("uint32", 2, 2),
	vectorV: Spec.vector("uint24", 0, 4),
};

const testMessage1 = new Message(testSpec, {
	enum: 0xFFFE,
	number: 0xAA,
	vectorF: [0x12345678, 0xDDCCBBAA],
	vectorV: []
});

describe('Message tests =>', () => {
	it('constructor', function () {

		assert.equal(testMessage1.enum, 0xFFFE, "Eigenschaft stimmt nicht überein: 'enum'");
		assert.equal(testMessage1.number, 0xAA, "Eigenschaft stimmt nicht überein: 'number'");
		assert.ok(arrayEquals(testMessage1.vectorF, [0x12345678, 0xDDCCBBAA]), "Eigenschaft stimmt nicht überein: 'vectorF'");
		assert.ok(arrayEquals(testMessage1.vectorV, []), "Eigenschaft stimmt nicht überein: 'vectorV'");

	});

	const rawMessage1 = testMessage1.serialize();

	it('serialize 1', () => {
		const expected = [
			0xFF, 0xFE, 0xAA, 0x12, 0x34, 0x56, 0x78, 0xDD, 0xCC, 0xBB, 0xAA, 0
		];

		assert.ok(arrayEquals(rawMessage1, expected), "Daten stimmen nicht überein");
	});

	it('deserialize 1', () => {
		const msg = new Message(testSpec);
		msg.deserialize(rawMessage1);

		for (let property of ["enum", "number"]) {
			assert.equal(testMessage1[property], msg[property], `Eigenschaft stimmt nicht überein: ${property}`);
		}
		for (let property of ["vectorF", "vectorV"]) {
			assert.ok(arrayEquals(testMessage1[property], msg[property]), `Eigenschaft stimmt nicht überein: ${property}`);
		}

	});

	it('deserialize 2', () => {
		const testMessage2 = new Message(testSpec, {
			enum: 0xAAAA,
			number: 0xBB,
			vectorF: [0x87654321, 0x01234567],
			vectorV: [0xAAAAAA, 0xBBBBBB, 0xCCDDEE]
		});
		const rawMessage2 = [
			0xAA, 0xAA, 0xBB, 0x87, 0x65, 0x43, 0x21, 0x01, 0x23, 0x45, 0x67, 9, 0xAA, 0xAA, 0xAA, 0xBB, 0xBB, 0xBB, 0xCC, 0xDD, 0xEE
		];
		const msg = new Message(testSpec);
		msg.deserialize(rawMessage2);

		for (let property of ["enum", "number"]) {
			assert.equal(testMessage2[property], msg[property], `Eigenschaft stimmt nicht überein: ${property}`);
		}
		for (let property of ["vectorF", "vectorV"]) {
			assert.ok(arrayEquals(testMessage2[property], msg[property]), `Eigenschaft stimmt nicht überein: ${property}`);
		}

	});
});
