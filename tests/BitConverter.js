var assert = require('assert');
var arrayEquals = require('./util').arrayEquals;
var BitConverter = require('../build/lib/BitConverter').default;

describe('BitConverter Number Tests =>', () => {

	it('uint8 read', () => {
		const input = new Uint8Array([0xFE]);
		const expected = 0xFE;
		const expectedDelta = 1;
		const output = BitConverter.readNumber["uint8"](input);

		assert.equal(output.value, expected, "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
		assert.equal(output.delta, expectedDelta, "Delta stimmt nicht mit dem erwarteten Wert überein");
    });

	it('uint8 write 1', () => {
		const input = 0xFE;
		const expected = [0xFE];
		const expectedDelta = 1;
		const output = BitConverter.writeNumber["uint8"](input);
		
		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
		assert.equal(output.delta, expectedDelta, "Delta stimmt nicht mit dem erwarteten Wert überein");
	});
	it('uint8 write 2', () => {
		const input = 0xFE;
		const expected = [0, 0, 0xFE];
		const expectedDelta = 1;
		let output = [0, 0, 0];
		output = BitConverter.writeNumber["uint8"](input, output, 2);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
		assert.equal(output.delta, expectedDelta, "Delta stimmt nicht mit dem erwarteten Wert überein");
	});

	it('uint16 read', () => {
		const input = new Uint8Array([0xFE, 0xFD]);
		const expected = 0xFEFD;
		const expectedDelta = 2;
		const output = BitConverter.readNumber["uint16"](input);

		assert.equal(output.value, expected, "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
		assert.equal(output.delta, expectedDelta, "Delta stimmt nicht mit dem erwarteten Wert überein");
	});

	it('uint16 write 1', () => {
		const input = 0xFEFD;
		const expected = [0xFE, 0xFD];
		const expectedDelta = 2;
		const output = BitConverter.writeNumber["uint16"](input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
		assert.equal(output.delta, expectedDelta, "Delta stimmt nicht mit dem erwarteten Wert überein");
	});
	it('uint16 write 2', () => {
		const input = 0xFEFD;
		const expected = [0, 0xFE, 0xFD];
		const expectedDelta = 2;
		let output = [0, 0, 0];
		output = BitConverter.writeNumber["uint16"](input, output, 1);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
		assert.equal(output.delta, expectedDelta, "Delta stimmt nicht mit dem erwarteten Wert überein");
	});

	it('uint24 read', () => {
		const input = new Uint8Array([0xFE, 0xFD, 0xFC]);
		const expected = 0xFEFDFC;
		const expectedDelta = 3;
		const output = BitConverter.readNumber["uint24"](input);

		assert.equal(output.value, expected, "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
		assert.equal(output.delta, expectedDelta, "Delta stimmt nicht mit dem erwarteten Wert überein");
	});

	it('uint24 write 1', () => {
		const input = 0xFEFDFC;
		const expected = [0xFE, 0xFD, 0xFC];
		const expectedDelta = 3;
		const output = BitConverter.writeNumber["uint24"](input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
		assert.equal(output.delta, expectedDelta, "Delta stimmt nicht mit dem erwarteten Wert überein");
	});
	it('uint24 write 2', () => {
		const input = 0xFEFDFC;
		const expected = [0, 0xFE, 0xFD, 0xFC, 0];
		const expectedDelta = 3;
		let output = [0, 0, 0, 0, 0];
		output = BitConverter.writeNumber["uint24"](input, output, 1);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
		assert.equal(output.delta, expectedDelta, "Delta stimmt nicht mit dem erwarteten Wert überein");
	});

	it('uint32 read', () => {
		const input = new Uint8Array([0xFE, 0xFD, 0xFC, 0xFB]);
		const expected = 0xFEFDFCFB;
		const expectedDelta = 4;
		const output = BitConverter.readNumber["uint32"](input);

		assert.equal(output.value, expected, "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
		assert.equal(output.delta, expectedDelta, "Delta stimmt nicht mit dem erwarteten Wert überein");
	});

	it('uint32 write 1', () => {
		const input = 0xFEFDFCFB;
		const expected = [0xFE, 0xFD, 0xFC, 0xFB];
		const expectedDelta = 4;
		const output = BitConverter.writeNumber["uint32"](input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
		assert.equal(output.delta, expectedDelta, "Delta stimmt nicht mit dem erwarteten Wert überein");
	});
	it('uint32 write 2', () => {
		const input = 0xFEFDFCFB;
		const expected = [0, 0xFE, 0xFD, 0xFC, 0xFB];
		const expectedDelta = 4;
		let output = [0, 0, 0, 0, 0];
		output = BitConverter.writeNumber["uint32"](input, output, 1);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
		assert.equal(output.delta, expectedDelta, "Delta stimmt nicht mit dem erwarteten Wert überein");
	});

});

describe('BitConverter fixed vector Tests =>', () => {

	it('uint8 read', () => {
		const input = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const expected = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const output = BitConverter.readVectorFixed["uint8"](6, input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint8 write 1', () => {
		const input = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const expected = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const output = BitConverter.writeVectorFixed["uint8"](input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint8 write 2', () => {
		const input = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const expected = [0,0, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const output = new Array(expected.length);
		for (let i = 0; i < output.length; i++) output[i] = 0;
		BitConverter.writeVectorFixed["uint8"](input, output, 2);

		assert.ok(arrayEquals(expected, output), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});

	it('uint16 read', () => {
		const input = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const expected = [0xFEFD, 0xFCFB, 0xFAFF];
		const output = BitConverter.readVectorFixed["uint16"](3, input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint16 write 1', () => {
		const input = [0xFEFD, 0xFCFB, 0xFAFF];
		const expected = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const output = BitConverter.writeVectorFixed["uint16"](input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint16 write 2', () => {
		const input = [0xFEFD, 0xFCFB, 0xFAFF];
		const expected = [0, 0, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const output = new Array(expected.length);
		for (let i = 0; i < output.length; i++) output[i] = 0;
		BitConverter.writeVectorFixed["uint16"](input, output, 2);

		assert.ok(arrayEquals(expected, output), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});

	it('uint24 read', () => {
		const input = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const expected = [0xFEFDFC, 0xFBFAFF];
		const output = BitConverter.readVectorFixed["uint24"](2, input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint24 write 1', () => {
		const input = [0xFEFDFC, 0xFBFAFF];
		const expected = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const output = BitConverter.writeVectorFixed["uint24"](input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint24 write 2', () => {
		const input = [0xFEFDFC, 0xFBFAFF];
		const expected = [0, 0, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const output = new Array(expected.length);
		for (let i = 0; i < output.length; i++) output[i] = 0;
		BitConverter.writeVectorFixed["uint24"](input, output, 2);

		assert.ok(arrayEquals(expected, output), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});

	it('uint32 read', () => {
		const input = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF, 0xFE, 0xFD];
		const expected = [0xFEFDFCFB, 0xFAFFFEFD];
		const output = BitConverter.readVectorFixed["uint32"](2, input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint32 write 1', () => {
		const input = [0xFEFDFCFB, 0xFAFFFEFD];
		const expected = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF, 0xFE, 0xFD];
		const output = BitConverter.writeVectorFixed["uint32"](input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint32 write 2', () => {
		const input = [0xFEFDFCFB, 0xFAFFFEFD];
		const expected = [0, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF, 0xFE, 0xFD];
		const output = new Array(expected.length);
		for (let i = 0; i < output.length; i++) output[i] = 0;
		BitConverter.writeVectorFixed["uint32"](input, output, 1);

		assert.ok(arrayEquals(expected, output), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});

});

describe('BitConverter variable vector Tests =>', () => {

	it('uint8 read 1', () => {
		const input = [6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const expected = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const output = BitConverter.readVectorVariable["uint8"](255, input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint8 read 2', () => {
		const input = [0, 6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const expected = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const output = BitConverter.readVectorVariable["uint8"](256, input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint8 write 1', () => {
		const input = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const expected = [6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const output = BitConverter.writeVectorVariable["uint8"](input, 255);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint8 write 2', () => {
		const input = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const expected = [0, 6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const output = BitConverter.writeVectorVariable["uint8"](input, 256);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});

	it('uint16 read 1', () => {
		const input = [6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const expected = [0xFEFD, 0xFCFB, 0xFAFF];
		const output = BitConverter.readVectorVariable["uint16"](127, input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint16 read 2', () => {
		const input = [0, 6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const expected = [0xFEFD, 0xFCFB, 0xFAFF];
		const output = BitConverter.readVectorVariable["uint16"](128, input);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint16 write 1', () => {
		const input = [0xFEFD, 0xFCFB, 0xFAFF];
		const expected = [6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const output = BitConverter.writeVectorVariable["uint16"](input, 127);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});
	it('uint16 write 2', () => {
		const input = [0xFEFD, 0xFCFB, 0xFAFF];
		const expected = [0, 6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
		const output = BitConverter.writeVectorVariable["uint16"](input, 128);

		assert.ok(arrayEquals(expected, output.value), "Daten stimmen nicht mit dem erwarteten Ergebnis überein");
	});

});