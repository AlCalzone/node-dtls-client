//import { expect } from "chai";
//import * as TypeSpecs from "./TypeSpecs";
//import { TLSStruct } from "./TLSStruct";
//import { Vector } from "./Vector";

//const num8 = TypeSpecs.uint8;
//const num16 = TypeSpecs.uint16;
//const num24 = TypeSpecs.uint24;
//enum test {
//	a = 1,
//	b = 5,
//	c = 7
//}
//const enm = TypeSpecs.define.Enum("uint16", test);

//const vec8 = TypeSpecs.define.Vector(num8, 4);
//const vec24 = TypeSpecs.define.Vector(num24, 0, 6);
//const vec16 = TypeSpecs.define.Vector(num16, 0, 4, true);
//const vec16_2 = TypeSpecs.define.Vector(num16, 4, 4, true);
//const vec0 = TypeSpecs.define.Vector(num8);

//class TestStruct extends TLSStruct {
//	static readonly __spec = {
//		propA: TypeSpecs.uint16,
//		propB: vec8
//	};

//	constructor(
//		public propA: number,
//		public propB: Vector<number>
//	) { 
//		super(TestStruct.__spec);
//	}

//}
//const strc = TypeSpecs.define.Struct(TestStruct);


//describe('TypeSpec definitions =>', () => {

//	// Number/Enum tests
//	it('define number', () => {
//		expect(num16).to.deep.equal({ type: "number", size: "uint16"});
//	});
//	it('get number size', () => {
//		expect(TypeSpecs.getPrimitiveSize(num16)).to.equal(16);
//	});

//	it('define enum', () => {
//		expect(enm).to.deep.equal({ type: "enum", size: "uint16", enumType: test });
//	});
//	it('get enum size', () => {
//		expect(TypeSpecs.getPrimitiveSize(enm)).to.equal(16);
//	});

//	// Vector tests
//	it('define uint8[] (fixed)', () => {
//		expect(vec8).to.deep.equal({
//			type: "vector",
//			itemSpec: num8,
//			minLength: 4, maxLength: 4,
//			optional: false
//		});
//	});
//	it('define uint24[] (variable)', () => {
//		expect(vec24).to.deep.equal({
//			type: "vector",
//			itemSpec: num24,
//			minLength: 0, maxLength: 6,
//			optional: false
//		});
//	});
//	it('define uint16[] (variable, optional)', () => {
//		expect(vec16).to.deep.equal({
//			type: "vector",
//			itemSpec: num16,
//			minLength: 0, maxLength: 4,
//			optional: true
//		});
//	});
//	it('define uint16[] (fixed, optional)', () => {
//		expect(vec16_2).to.deep.equal({
//			type: "vector",
//			itemSpec: num16,
//			minLength: 4, maxLength: 4,
//			optional: true
//		});
//	});
//	it('define null vector', () => {
//		expect(vec0).to.deep.equal({
//			type: "vector",
//			itemSpec: num8,
//			minLength: 0, maxLength: 0,
//			optional: false
//		});
//	});

//	// Struct tests
//	it('define struct', () => {
//		expect(strc).to.deep.equal({
//			type: "struct",
//			spec: TestStruct.__spec,
//			structType: TestStruct
//		});
//	});
//});

//describe('TypeSpec vector (de)serialization =>', () => {

//	let vec_fixed_1 = new Vector(vec8, [1, 2, 3, 4]);
//	it('uint8[] fixed should report constant length', () => {
//		expect(vec_fixed_1.isVariableLength).to.be.false;
//	})
//	let vec_raw_1 = vec_fixed_1.serialize();
//	let vec_raw_1_expected = Buffer.from([1, 2, 3, 4]);
//	it('uint8[] fixed serialize', () => {
//		expect(vec_raw_1).to.deep.equal(vec_raw_1_expected);
//	});
//	let vec_parsed_1 = Vector.from(vec8, vec_raw_1).result;
//	it('uint8[] fixed deserialize', () => {
//		expect(vec_parsed_1.items).to.deep.equal([1, 2, 3, 4]);
//	});
//	it('fixed vector should throw on empty buffer', () => {
//		expect(Vector.from.bind(Vector, vec8, Buffer.alloc(0))).to.throw();
//	})

//	let vec_variable_1 = new Vector(vec24, [0xFFFEFD, 0xFCFBFA]);
//	it('uint24[] variable should report variable length', () => {
//		expect(vec_variable_1.isVariableLength).to.be.true;
//	})
//	let vec_raw_2 = vec_variable_1.serialize();
//	let vec_raw_2_expected = Buffer.from([6, 0xFF, 0xFE, 0xFD, 0xFC, 0xFB, 0xFA]);
//	it('uint24[] variable serialize', () => {
//		expect(vec_raw_2).to.deep.equal(vec_raw_2_expected);
//	});
//	let vec_parsed_2 = Vector.from(vec24, vec_raw_2).result;
//	it('uint24[] variable deserialize', () => {
//		expect(vec_parsed_2.items).to.deep.equal([0xFFFEFD, 0xFCFBFA]);
//	});


//	let vec_variable_2 = new Vector(vec16, []);
//	let vec_raw_3 = vec_variable_2.serialize();
//	let vec_raw_3_expected = Buffer.from([]);
//	it('null vector serialize', () => {
//		expect(vec_raw_3).to.deep.equal(vec_raw_3_expected);
//	});
//	let vec_parsed_3 = Vector.from(vec16, vec_raw_3).result;
//	it('null vector deserialize', () => {
//		expect(vec_parsed_3.items).to.deep.equal([]);
//	});

//});

//describe('TypeSpec struct (de)serialization =>', () => {

//	class TestStruct2 extends TLSStruct {
//		static readonly __spec = {
//			propA: TypeSpecs.uint16,
//			propB: TypeSpecs.define.Enum("uint24", null),
//			propC: TypeSpecs.define.Struct(TestStruct),
//		};

//		constructor(
//			public propA: number,
//			public propB: number,
//			public propC: TestStruct
//		) {
//			super(TestStruct2.__spec);
//		}

//	}
//	const strc2 = TypeSpecs.define.Struct(TestStruct2);

//	let the_struct = new TestStruct2(
//		1,
//		2,
//		new TestStruct(
//			3,
//			new Vector(TestStruct.__spec.propB, [9, 8, 7, 6])
//		)
//	);

//	let struct_raw = the_struct.serialize();
//	let struct_raw_expected = Buffer.from([
//		0, 1,
//		0, 0, 2,
//		0, 3,
//		9, 8, 7, 6
//	]);
//	it('struct serialize', () => {
//		expect(struct_raw).to.be.deep.equal(struct_raw_expected);
//	});
//	let deserialized = TLSStruct.from(strc2, struct_raw_expected).result as TestStruct2;
//	it('struct deserialize', () => {
//		expect(deserialized.propA).to.be.equal(1);
//		expect(deserialized.propB).to.be.equal(2);
//		expect(deserialized.propC.propA).to.be.equal(3);
//		expect(deserialized.propC.propB.items).to.deep.equal([9, 8, 7, 6]);
//	});

//});

//describe('TypeSpec struct[] (de)serialization =>', () => {

//	class ItemStruct extends TLSStruct {
//		static readonly __spec = {
//			a: TypeSpecs.uint16,
//			b: TypeSpecs.uint16,
//		};

//		constructor(
//			public a: number,
//			public b: number,
//		) {
//			super(ItemStruct.__spec);
//		}

//	}
//	const itemDef = TypeSpecs.define.Struct(ItemStruct);
//	const vecDef = TypeSpecs.define.Vector(itemDef, 12 /* 3 items */);
//	const vec = new Vector<ItemStruct>(
//		vecDef,
//		[
//			new ItemStruct(1, 2),
//			new ItemStruct(5, 6),
//			new ItemStruct(8, 9)
//		]
//	);

//	let vec_raw = vec.serialize();
//	let vec_raw_expected = Buffer.from([
//		0, 1, 0, 2,
//		0, 5, 0, 6,
//		0, 8, 0, 9
//	]);
//	it('struct[] serialize', () => {
//		expect(vec_raw).to.be.deep.equal(vec_raw_expected);
//	});
//	let deserialized = Vector.from(vecDef, vec_raw).result;
//	it('struct[] deserialize', () => {
//		expect(deserialized.items[0]).to.include({ a: 1, b: 2 });
//		expect(deserialized.items[1]).to.include({ a: 5, b: 6 });
//		expect(deserialized.items[2]).to.include({ a: 8, b: 9 });
//	});

//});