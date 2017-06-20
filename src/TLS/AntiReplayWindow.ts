
/**
 * Provides protection against replay attacks by remembering received packets in a sliding window
 */
export class AntiReplayWindow {
	
	private const width = 64; // bits / entries, must be multiple of INT_SIZE
	private const INT_SIZE = 32; // in JS, bitwise operators use 32bit ints
	
	// window bitmap looks as follows:
	//  v- upper end                    lower end --v
	// [111011 ... window_n]...[11111101 ... window_0]
	private let window: number[] = [];
	private let ceiling: number; // upper end of the window bitmap / highest received seq_num
	
	constructor() {
		this.reset();
	}
	/**
	 * Initializes the anti replay window to its default state
	 */
	reset() : void {
		for (let i = 0; i < width / INT_SIZE; i++) {
			window[i] = 0;
		}
		ceiling = width-1; 
	}
	
	/**
	 * Checks if the packet with the given sequence number may be received or has to be discarded
	 * @param seq_num - The sequence number of the packet to be checked
	 */
	mayReceive(seq_num: number) : boolean {
		if (seq_num > ceiling + width) {
			// we skipped a lot of packets... I don't think we should accept
			return false;
		} else if (seq_num > ceiling) {
			// always accept new packets
			return true;
		} else if (seq_num >= ceiling - width + 1 && seq_num <= ceiling) {
			// packet falls within the window, check if it was received already.
			// if so, don't accept
			return !this.hasReceived(seq_num);
		} else /* seq_num <= ceiling - width */ {
			// too old, don't accept
			return false;
		}
	}
	
	/**
	 * Checks if the packet with the given sequence number is marked as received
	 * @param seq_num - The sequence number of the packet to be checked
	 */
	hasReceived(seq_num: number) : boolean {
		// check if the packet was received already
		const lowerBound = ceiling - width + 1;
		// find out where the bit is located
		let bitIndex = seq_num - lowerBound;
		let windowIndex = Math.floor(bitIndex / INT_SIZE);
		let windowBit = bitIndex % INT_SIZE;
		let flag = 1 << windowBit;
		// check if it is set;
		return (this.window[windowIndex] & flag) === flag;
	}
	
	/**
	 * Marks the packet with the given sequence number as received
	 * @param seq_num - The sequence number of the packet
	 */
	markAsReceived(seq_num: number) : void {
		if (seq_num > ceiling) {
			// shift the window
			const amount = seq_num - ceiling;
			// first shift whole blocks
			while (amount > INT_SIZE) {
				for (let i = 1; i < this.window.length; i++) {
					this.window[i-1] = this.window[i];
				}
				this.window[this.window.length-1] = 0;
				amount -= INT_SIZE;
			}
			// now shift bitwise (to the right)
			let overflow = 0;
			for (let i = 0; i < this.window.length; i++) {
				overflow = this.window[i] << (INT_SIZE - amount); // BBBBBBAA => AA000000
				this.window[i] = this.window[i] >>>= amount; // BBBBBBAA ==> 00BBBBBB
				if (i > 0) this.window[i-1] |= overflow;
			}
			// and remember the new ceiling
			ceiling += amount;
		}	
		const lowerBound = ceiling - width + 1;
			
		// find out where the bit is located
		let bitIndex = seq_num - lowerBound;
		let windowIndex = Math.floor(bitIndex / INT_SIZE);
		let windowBit = bitIndex % INT_SIZE;
		let flag = 1 << windowBit;
		// and set it
		this.window[windowIndex] |= flag;		
	}
}