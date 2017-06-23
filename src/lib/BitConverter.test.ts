//import { expect } from "chai";

//import * as BitConverter from "./BitConverter";
//import { fitToWholeBytes } from "./util";

//const msg_data_mismatch = "Daten stimmen nicht mit dem erwarteten Ergebnis überein";
//const msg_delta_mismatch = "Delta stimmt nicht mit dem erwarteten Wert überein";

//describe('BitConverter Number Tests =>', () => {

//	it('uint8 read', () => {
//		const input = Buffer.from([0xFE]);
//		const expected = 0xFE;
//		const expectedDelta = 1;
//		const output = BitConverter.readNumber["uint8"](input);

//		expect(output.value, msg_data_mismatch).to.equal(expected);
//		expect(output.delta, msg_delta_mismatch).to.equal(expectedDelta);
//	});

//	it('uint8 write 1', () => {
//		const input = 0xFE;
//		const expected = Buffer.from([0xFE]);
//		const expectedDelta = 1;
//		const output = BitConverter.writeNumber["uint8"](input);
		
//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//		expect(output.delta, msg_delta_mismatch).to.equal(expectedDelta);
//	});
//	it('uint8 write 2', () => {
//		const input = 0xFE;
//		const expected = Buffer.from([0, 0, 0xFE]);
//		const expectedDelta = 1;
//		let initial = Buffer.from([0, 0, 0]);
//		const output = BitConverter.writeNumber["uint8"](input, initial, 2);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//		expect(output.delta, msg_delta_mismatch).to.equal(expectedDelta);
//	});

//	it('uint16 read', () => {
//		const input = Buffer.from([0xFE, 0xFD]);
//		const expected = 0xFEFD;
//		const expectedDelta = 2;
//		const output = BitConverter.readNumber["uint16"](input);

//		expect(output.value, msg_data_mismatch).to.equal(expected);
//		expect(output.delta, msg_delta_mismatch).to.equal(expectedDelta);
//	});

//	it('uint16 write 1', () => {
//		const input = 0xFEFD;
//		const expected = Buffer.from([0xFE, 0xFD]);
//		const expectedDelta = 2;
//		const output = BitConverter.writeNumber["uint16"](input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//		expect(output.delta, msg_delta_mismatch).to.equal(expectedDelta);
//	});
//	it('uint16 write 2', () => {
//		const input = 0xFEFD;
//		const expected = Buffer.from([0, 0xFE, 0xFD]);
//		const expectedDelta = 2;
//		let initial = Buffer.from([0, 0, 0]);
//		const output = BitConverter.writeNumber["uint16"](input, initial, 1);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//		expect(output.delta, msg_delta_mismatch).to.equal(expectedDelta);
//	});

//	it('uint24 read', () => {
//		const input = Buffer.from([0xFE, 0xFD, 0xFC]);
//		const expected = 0xFEFDFC;
//		const expectedDelta = 3;
//		const output = BitConverter.readNumber["uint24"](input);

//		expect(output.value, msg_data_mismatch).to.equal(expected);
//		expect(output.delta, msg_delta_mismatch).to.equal(expectedDelta);
//	});

//	it('uint24 write 1', () => {
//		const input = 0xFEFDFC;
//		const expected = Buffer.from([0xFE, 0xFD, 0xFC]);
//		const expectedDelta = 3;
//		const output = BitConverter.writeNumber["uint24"](input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//		expect(output.delta, msg_delta_mismatch).to.equal(expectedDelta);
//	});
//	it('uint24 write 2', () => {
//		const input = 0xFEFDFC;
//		const expected = Buffer.from([0, 0xFE, 0xFD, 0xFC, 0]);
//		const expectedDelta = 3;
//		let initial = Buffer.from([0, 0, 0, 0, 0]);
//		const output = BitConverter.writeNumber["uint24"](input, initial, 1);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//		expect(output.delta, msg_delta_mismatch).to.equal(expectedDelta);
//	});

//	it('uint32 read', () => {
//		const input = Buffer.from([0xFE, 0xFD, 0xFC, 0xFB]);
//		const expected = 0xFEFDFCFB;
//		const expectedDelta = 4;
//		const output = BitConverter.readNumber["uint32"](input);

//		expect(output.value, msg_data_mismatch).to.equal(expected);
//		expect(output.delta, msg_delta_mismatch).to.equal(expectedDelta);
//	});

//	it('uint32 write 1', () => {
//		const input = 0xFEFDFCFB;
//		const expected = Buffer.from([0xFE, 0xFD, 0xFC, 0xFB]);
//		const expectedDelta = 4;
//		const output = BitConverter.writeNumber["uint32"](input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//		expect(output.delta, msg_delta_mismatch).to.equal(expectedDelta);
//	});
//	it('uint32 write 2', () => {
//		const input = 0xFEFDFCFB;
//		const expected = Buffer.from([0, 0xFE, 0xFD, 0xFC, 0xFB]);
//		const expectedDelta = 4;
//		let initial = Buffer.from([0, 0, 0, 0, 0]);
//		const output = BitConverter.writeNumber["uint32"](input, initial, 1);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//		expect(output.delta, msg_delta_mismatch).to.equal(expectedDelta);
//	});

//});

//describe('BitConverter fixed vector Tests =>', () => {

//	it('uint8 read 1', () => {
//		const input = Buffer.from([0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const expected = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
//		const output = BitConverter.readVectorFixed["uint8"](6, input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint8 read 2', () => {
//		const input = Buffer.from([0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const expected = [0xFC, 0xFB, 0xFA, 0xFF];
//		const output = BitConverter.readVectorFixed["uint8"](4, input, 2);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint8 write 1', () => {
//		const input = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
//		const expected = Buffer.from([0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const output = BitConverter.writeVectorFixed["uint8"](input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint8 write 2', () => {
//		const input = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
//		const expected = Buffer.from([0,0, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const output = Buffer.alloc(expected.length, 0);
//		BitConverter.writeVectorFixed["uint8"](input, output, 2);

//		expect(expected, msg_data_mismatch).to.deep.equal(output);
//	});

//	it('uint16 read 1', () => {
//		const input = Buffer.from([0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const expected = [0xFEFD, 0xFCFB, 0xFAFF];
//		const output = BitConverter.readVectorFixed["uint16"](3, input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint16 read 2', () => {
//		const input = Buffer.from([0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const expected = [0xFCFB, 0xFAFF];
//		const output = BitConverter.readVectorFixed["uint16"](2, input, 2);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint16 write 1', () => {
//		const input = [0xFEFD, 0xFCFB, 0xFAFF];
//		const expected = Buffer.from([0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const output = BitConverter.writeVectorFixed["uint16"](input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint16 write 2', () => {
//		const input = [0xFEFD, 0xFCFB, 0xFAFF];
//		const expected = Buffer.from([0, 0, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const output = Buffer.alloc(expected.length, 0);
//		BitConverter.writeVectorFixed["uint16"](input, output, 2);

//		expect(expected, msg_data_mismatch).to.deep.equal(output);
//	});

//	it('uint24 read', () => {
//		const input = Buffer.from([0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const expected = [0xFEFDFC, 0xFBFAFF];
//		const output = BitConverter.readVectorFixed["uint24"](2, input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint24 write 1', () => {
//		const input = [0xFEFDFC, 0xFBFAFF];
//		const expected = Buffer.from([0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const output = BitConverter.writeVectorFixed["uint24"](input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint24 write 2', () => {
//		const input = [0xFEFDFC, 0xFBFAFF];
//		const expected = Buffer.from([0, 0, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const output = Buffer.alloc(expected.length, 0);
//		BitConverter.writeVectorFixed["uint24"](input, output, 2);

//		expect(expected, msg_data_mismatch).to.deep.equal(output);
//	});

//	it('uint32 read', () => {
//		const input = Buffer.from([0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF, 0xFE, 0xFD]);
//		const expected = [0xFEFDFCFB, 0xFAFFFEFD];
//		const output = BitConverter.readVectorFixed["uint32"](2, input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint32 write 1', () => {
//		const input = [0xFEFDFCFB, 0xFAFFFEFD];
//		const expected = Buffer.from([0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF, 0xFE, 0xFD]);
//		const output = BitConverter.writeVectorFixed["uint32"](input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint32 write 2', () => {
//		const input = [0xFEFDFCFB, 0xFAFFFEFD];
//		const expected = Buffer.from([0, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF, 0xFE, 0xFD]);
//		const output = Buffer.alloc(expected.length, 0);
//		BitConverter.writeVectorFixed["uint32"](input, output, 1);

//		expect(expected, msg_data_mismatch).to.deep.equal(output);
//	});

//});

//describe('BitConverter variable vector Tests =>', () => {

//	it('uint8 read 1', () => {
//		const input = Buffer.from([6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const expected = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
//		const output = BitConverter.readVectorVariable["uint8"](255, input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint8 read 2', () => {
//		const input = Buffer.from([0, 6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const expected = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
//		const output = BitConverter.readVectorVariable["uint8"](256, input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint8 read 3', () => {
//		const input = Buffer.from([0, 0, 0, 6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const expected = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
//		const output = BitConverter.readVectorVariable["uint8"](256, input, 2);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint8 write 1', () => {
//		const input = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
//		const expected = Buffer.from([6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const output = BitConverter.writeVectorVariable["uint8"](input, 255);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint8 write 2', () => {
//		const input = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
//		const expected = Buffer.from([0, 6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const output = BitConverter.writeVectorVariable["uint8"](input, 256);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint8 write 3', () => {
//		const input = [0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF];
//		const expected = Buffer.from([0, 0, 0, 6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const initial = Buffer.alloc(10, 0);
//		const output = BitConverter.writeVectorVariable["uint8"](input, 256, initial, 2);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});

//	it('uint16 read 1', () => {
//		const input = Buffer.from([6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const expected = [0xFEFD, 0xFCFB, 0xFAFF];
//		const output = BitConverter.readVectorVariable["uint16"](127, input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint16 read 2', () => {
//		const input = Buffer.from([0, 6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const expected = [0xFEFD, 0xFCFB, 0xFAFF];
//		const output = BitConverter.readVectorVariable["uint16"](128, input);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint16 read3', () => {
//		const input = Buffer.from([0, 0, 0, 6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const expected = [0xFEFD, 0xFCFB, 0xFAFF];
//		const output = BitConverter.readVectorVariable["uint16"](128, input, 2);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint16 write 1', () => {
//		const input = [0xFEFD, 0xFCFB, 0xFAFF];
//		const expected = Buffer.from([6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const output = BitConverter.writeVectorVariable["uint16"](input, 127);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint16 write 2', () => {
//		const input = [0xFEFD, 0xFCFB, 0xFAFF];
//		const expected = Buffer.from([0, 6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const output = BitConverter.writeVectorVariable["uint16"](input, 128);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});
//	it('uint16 write 2', () => {
//		const input = [0xFEFD, 0xFCFB, 0xFAFF];
//		const expected = Buffer.from([0, 0, 0, 6, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA, 0xFF]);
//		const initial = Buffer.alloc(10, 0);
//		const output = BitConverter.writeVectorVariable["uint16"](input, 128, initial, 2);

//		expect(expected, msg_data_mismatch).to.deep.equal(output.value);
//	});

//	it('zero length fringe case', () => {
//		expect(fitToWholeBytes(0)).to.equal(1);
//	});
//});