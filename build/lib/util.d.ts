/**
* Calculates how many bytes are neccessary to express the given value
* @param value {number} - the value to be measured
* @returns {number}
*/
export declare function fitToWholeBytes(value: number): number;
/**
 * Provides a static implementation of an interface with static and prototype methods
 */
export declare function staticImplements<T>(): (constructor: T) => void;
