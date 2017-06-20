

export class RecordLayer {

	// TODO: mal sehen, ob das nicht woanders besser aufgehoben ist
	
	/**
	 * Maximum transfer unit of the underlying connection.
	 * Note: Ethernet supports up to 1500 bytes, of which 20 bytes are reserved for the IP header and 8 for the UDP header
	 */
	public static MTU: number = 1280;
	public static readonly MTU_OVERHEAD = 20+8;
	public static get MAX_PAYLOAD_SIZE() {return RecordLayer.MTU - RecordLayer.MTU_OVERHEAD;}

}