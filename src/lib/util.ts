/**
 * Calculates how many bytes are neccessary to express the given value
 * @param value {number} - the value to be measured
 * @returns {number}
 */
export function fitToWholeBytes(value: number): number {
	let ret = 0;
	while (value !== 0) {
		ret++;
		value >>>= 8;
	}
	if (ret === 0) ret++;
	return ret;
}
