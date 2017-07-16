export type BitSizes = 8 | 16 | 24 | 32 | 48 | 64;

export function numberToBuffer(value: number, size: BitSizes) {
	const n = size / 8;
	const ret = Buffer.alloc(n);
	for (let i = n - 1; i >= 0; i--) {
		ret[i] = value & 0xff;
		value >>>= 8;
	}
	return ret;
}

export function bufferToNumber(buf: Buffer, size: BitSizes, offset = 0) {
	let ret = 0;
	const n = size / 8;
	for (let i = 0; i < n; i++) {
		ret = ret * 256 + buf[i + offset];
	}
	return ret;
}

export function bufferToByteArray(buf: Buffer, offset = 0) : number[] {
	return Array.prototype.slice.apply(buf, [offset]);
}
