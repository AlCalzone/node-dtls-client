import { expect } from "chai";
import * as TypeSpecs from "./TypeSpecs";
import { TLSStruct } from "./TLSStruct";
import { Vector } from "./Vector";

const num8 = TypeSpecs.uint8;
const num16 = TypeSpecs.uint16;
const num24 = TypeSpecs.uint24;
enum test {
	a = 1,
	b = 5,
	c = 7
}
const enm = TypeSpecs.define.Enum("uint16", test);

const vec8 = TypeSpecs.define.Vector(num8, 4);
const vec24 = TypeSpecs.define.Vector(num24, 0, 6);
const vec16 = TypeSpecs.define.Vector(num16, 0, 4, true);
const vec16_2 = TypeSpecs.define.Vector(num16, 4, 4, true);
const vec0 = TypeSpecs.define.Vector(num8);

class TestStruct extends TLSStruct {
	static readonly __spec = {
		propA: TypeSpecs.uint16,
		propB: vec8
	};
}
const strc = TypeSpecs.define.Struct(TestStruct);


describe('TypeSpec definitions =>', () => {

	// Number/Enum tests
	it('define number', () => {
		expect(num16).to.deep.equal({ type: "number", size: "uint16"});
	});
	it('get number size', () => {
		expect(TypeSpecs.getPrimitiveSize(num16)).to.equal(16);
	});

	it('define enum', () => {
		expect(enm).to.deep.equal({ type: "enum", size: "uint16", enumType: test });
	});
	it('get enum size', () => {
		expect(TypeSpecs.getPrimitiveSize(enm)).to.equal(16);
	});

	// Vector tests
	it('define uint8[] (fixed)', () => {
		expect(vec8).to.deep.equal({
			type: "vector",
			itemSpec: num8,
			minLength: 4, maxLength: 4,
			optional: false
		});
	});
	it('define uint24[] (variable)', () => {
		expect(vec24).to.deep.equal({
			type: "vector",
			itemSpec: num24,
			minLength: 0, maxLength: 6,
			optional: false
		});
	});
	it('define uint16[] (variable, optional)', () => {
		expect(vec16).to.deep.equal({
			type: "vector",
			itemSpec: num16,
			minLength: 0, maxLength: 4,
			optional: true
		});
	});
	it('define uint16[] (fixed, optional)', () => {
		expect(vec16_2).to.deep.equal({
			type: "vector",
			itemSpec: num16,
			minLength: 4, maxLength: 4,
			optional: true
		});
	});
	it('define null vector', () => {
		expect(vec0).to.deep.equal({
			type: "vector",
			itemSpec: num8,
			minLength: 0, maxLength: 0,
			optional: false
		});
	});

	// Struct tests
	it('define struct', () => {
		expect(strc).to.deep.equal({
			type: "struct",
			spec: TestStruct.__spec,
			structType: TestStruct
		});
	});
});

describe('TypeSpec (de)serialization =>', () => {

	let vec_fixed_1 = new Vector(vec8, [1, 2, 3, 4]);
	it('uint8[] fixed should report constant length', () => {
		expect(vec_fixed_1.isVariableLength).to.be.false;
	})
	let vec_raw_1 = vec_fixed_1.serialize();
	let vec_raw_1_expected = Buffer.from([1, 2, 3, 4]);
	it('uint8[] fixed serialize', () => {
		expect(vec_raw_1).to.deep.equal(vec_raw_1_expected);
	});
	let vec_parsed_1 = Vector.from(vec8, vec_raw_1).result;
	it('uint8[] fixed deserialize', () => {
		expect(vec_parsed_1.items).to.deep.equal([1, 2, 3, 4]);
	});
	it('fixed vector should throw on empty buffer', () => {
		expect(Vector.from.bind(Vector, vec8, Buffer.alloc(0))).to.throw();
	})

	let vec_variable_1 = new Vector(vec24, [0xFFFEFD, 0xFCFBFA]);
	it('uint24[] variable should report variable length', () => {
		expect(vec_variable_1.isVariableLength).to.be.true;
	})
	let vec_raw_2 = vec_variable_1.serialize();
	let vec_raw_2_expected = Buffer.from([6, 0xFF, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA]);
	it('uint24[] variable serialize', () => {
		expect(vec_raw_2).to.deep.equal(vec_raw_2_expected);
	});
	let vec_parsed_2 = Vector.from(vec24, vec_raw_2).result;
	it('uint24[] variable deserialize', () => {
		expect(vec_parsed_2.items).to.deep.equal([0xFFFEFD, 0xFCFBFA]);
	});


	let vec_variable_2 = new Vector(vec16, []);
	let vec_raw_3 = vec_variable_2.serialize();
	let vec_raw_3_expected = Buffer.from([]);
	it('null vector serialize', () => {
		expect(vec_raw_3).to.deep.equal(vec_raw_3_expected);
	});
	let vec_parsed_3 = Vector.from(vec16, vec_raw_3).result;
	it('null vector deserialize', () => {
		expect(vec_parsed_3.items).to.deep.equal([]);
	});

});