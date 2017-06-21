import * as TLSTypes from "../TLS/TLSTypes";
import { TLSStruct } from "../TLS/TLSStruct";
import { extend } from "../lib/object-polyfill";
import { Random } from "../TLS/Random";
import { SessionID } from "../TLS/SessionID";
import { Cookie } from "./Cookie";
import { CipherSuite } from "../TLS/CipherSuite";
import { CompressionMethod } from "../TLS/ConnectionState";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { RecordLayer } from "./RecordLayer";

export abstract class Handshake extends TLSStruct {
	
	constructor(
		public msg_type: HandshakeType,
		bodySpec: TLSTypes.StructSpec,
		public body?: TLSStruct
	) {
		super(bodySpec, (body ? {body: body} : null));
	}

	public message_seq: number;
	
	/**
	 * Fragments this packet into a series of packets according to the configured MTU
	 * @returns An array of fragmented handshake messages - or a single one if it is small enough.
	 */
	fragmentMessage(): FragmentedHandshake[] {
		
		// spec only contains the body, so serialize() will only return that
		const wholeMessage : Buffer = this.serialize();
		let start = 0;
		let fragments: FragmentedHandshake[] = [];
		const maxFragmentLength = RecordLayer.MAX_PAYLOAD_SIZE - FragmentedHandshake.headerLength;
		// loop through the message and fragment it
		while (!fragments.length && start < wholeMessage.length) {
			// calculate maximum length, limited by MTU - IP/UDP headers - handshake overhead
			let fragmentLength = Math.min(maxFragmentLength, wholeMessage.length - start);
			// slice and dice
			const fragment = wholeMessage.slice(start, start + fragmentLength);
			//create the message
			fragments.push(new FragmentedHandshake(
				this.msg_type,
				wholeMessage.length,
				this.message_seq,
				start,
				fragment
			));
			// step forward by the actual fragment length
			start += fragment.length;
		}
		
		return fragments;
	}
	
	/**
	 * Parses a re-assembled handshake message into the correct object struture
	 * @param assembled - the re-assembled (or never-fragmented) message
	 */
	static parse(assembled: FragmentedHandshake) : Handshake {
		if (assembled.isFragmented())
			throw new Error("the message to be parsed MUST NOT be fragmented");
		
		if (HandshakeMessages.hasOwnProperty(assembled.msg_type)) {
			// find the right type for the body object
			const objConstructor = HandshakeMessages[assembled.msg_type];
			// extract the struct spec
			const spec = (objConstructor as any).__spec; // we can expect this to exist
			// parse the body object
			const body = objConstructor.from(
				spec
				assembled.fragment
				);
			// and feed it into a new Handshake instance
			const ret = new Handshake(
				assembled.msg_type,
				spec,
				body
			);
			ret.msg_seq = assembled.msg_seq;
			return ret;
		} else {
			throw new Error(`unsupported message type ${assembled.msg_type}`);
		}
	}
	
	// Implementation details:
	// message_seq starts at 0 for both client and server during the handshake. 
	// Each new (not retransmitted) message increases the value by 1.

}

export class FragmentedHandshake extends TLSStruct {

	static readonly __spec = {
		msg_type: new TLSTypes.Enum("uint8", HandshakeType),
		total_length: "uint24",
		message_seq: "uint16",
		fragment_offset: "uint24",
		// uint24 fragment_length is implied in the variable size vector
		fragment: new TLSTypes.Vector("uint8", 0, 2**24-1)
	}
	/**
	 * The amount of data consumed by a handshake message header (without the actual fragment)
	 */
	static readonly headerLength = 1+3+2+3+3; // TODO: dynamisch?
	
	constructor(
		public msg_type: HandshakeType,
		public total_length: number,
		public message_seq: number,
		public fragment_offset: number,
		public fragment: Buffer
	) {
		super(FragmentedHandshake.__spec);
	}
	
	/**
	 * Checks if this message is actually fragmented, i.e. total_length > fragment_length
	 */
	isFragmented(): boolean {
		return (this.fragment_offset !== 0) || (this.total_length > this.fragment.length);
	}
	
	/**
	 * Enforces an array of fragments to belong to a single message
	 * @throws Error
	 */
	// TODO: error Documentation ^^ ?
	private static function enforceSingleMessage(fragments: FragmentedHandshake[]): boolean {
		// check if we are looking at a single message, i.e. compare type, seq_num and length
		const singleMessage = fragments.every((val, i, arr) => {
			if (i > 0) {
				return val.msg_type === arr[0].msg_type &&
					val.seq_num === arr[0].seq_num &&
					val.total_length === arr[0].total_length
			}
			return true;
		});
		if (!singleMessage) 
			throw new Error('this series of fragments belongs to multiple messages'); // TODO: better type?		
	}
	
	/**
	 * Checks if the provided handshake fragments form a complete message
	 */
	static isComplete(fragments : FragmentedHandshake[]): boolean {
		// ignore empty arrays
		if (!(fragments && fragments.length)) return false;
		FragmentedHandshake.enforceSingleMessage(fragments);

		const firstSeqNum = fragments[0].seq_num;
		const totalLength = fragments[0].total_length;
		const ranges = fragments
			// map to fragment range (start and end index)
			.map(f => {start: f.fragment_offset, end: f.fragment_offset + f.fragment.length-1})
			// order the fragments by fragment offset
			.sort((a,b) => a.start - b.start)
			;
		// check if the fragments have no holes
		const noHoles = ranges.every((val, i, arr) => {
			if (i === 0) {
				// first fragment should start at 0
				if (val.start !== 0) return false; 
			} else {
				// every other fragment should touch or overlap the previous one
				if (val.start - arr[i-1].end > 1) return false;
			}
			// last fragment should end at totalLength-1
			if (i === arr.length-1) {if (val.end !== totalLength-1) return false; }
			// no problems
			return true;
		});
		
		return noHoles;
	}
	
	/**
	 * Reassembles a series of fragmented handshake messages into a complete one.
	 * Warning: doesn't check for validity, do that in advance!
	 */
	static reassemble(fragments : FragmentedHandshake[]) : FragmentedHandshake {
		// cannot reassemble empty arrays
		if (!(fragments && fragments.length)) 
			throw new Error("cannot reassemble handshake from empty array"); // TODO: Better type?
		
		// sort by fragment start
		fragments = fragments.sort((a,b) => a.fragment_offset - b.fragment_offset);
		// combine into a single buffer
		const combined = Buffer.allocUnsafe(fragments[0].total_length);
		for (let fragment of fragments) {
			fragment.copy(combined, fragment.fragment_offset);
		}
		
		// and return the complete message
		return new FragmentedHandshake(
			fragments[0].msg_type,
			fragments[0].total_length,
			fragments[0].message_seq,
			0,
			combined
		);
	}
	
}


export enum HandshakeType {
	hello_request = 0,
	client_hello = 1,
	server_hello = 2,
	hello_verify_request = 3,
	certificate = 11,
	server_key_exchange = 12,
	certificate_request = 13,
	server_hello_done = 14,
	certificate_verify = 15,
	client_key_exchange = 16,
	finished = 20
}
// define handshake messages for lookup
export const HandshakeMessages: {
	[type: HandshakeType]?: (any extends Handshake)
} = {};
HandshakeMessages[HandshakeType.hello_request] = HelloRequest;
HandshakeMessages[HandshakeType.client_hello] = ClientHello;
HandshakeMessages[HandshakeType.server_hello] = ServerHello;
HandshakeMessages[HandshakeType.hello_verify_request] = HelloVerifyRequest;
HandshakeMessages[HandshakeType.server_hello_done] = ServerHelloDone;
HandshakeMessages[HandshakeType.finished] = Finished;

// Handshake message implementations
export class HelloRequest extends Handshake {

	static readonly __bodySpec = {}

	constructor() {
		super(HandshakeType.hello_request, HelloRequest.__bodySpec);
	}

}

export class ClientHello extends Handshake {

	static readonly __bodySpec = {
		client_version: ProtocolVersion.__spec,
		random: Random.__spec,
		session_id: SessionID.__spec,
		cookie: Cookie.__spec,
		// TODO: Typed Vector CipherSuite cipher_suites< 1..2^ 15 - 1 > // definition differs from TLS spec: we count hte number of items, not bytes
		// TODO: Typed Vector CompressionMethod compression_methods< 1..2^ 8 - 1 >
	}

	static readonly __bodySpecWithExtensions = extend(ClientHello.__bodySpec, {
		// see http://wiki.osdev.org/TLS_Handshake
		// TODO: TypedVector Extension extensions< 0..2^ 16 - 1 >;
		// TODO: optional type -> may only appear last, present if bytes follow
		// TODO: item parser function
	})

	constructor(
		public client_version: ProtocolVersion,
		public session_id: SessionID,
		public cookie: Cookie,
		public extensions?: any
	) {
		super(
			HandshakeType.client_hello,
			extensions != undefined ? ClientHello.__bodySpecWithExtensions : ClientHello.__bodySpec
		);
	}

}

export class ServerHello extends Handshake {

	static readonly __bodySpec = {
		server_version: ProtocolVersion.__spec,
		random: Random.__spec,
		session_id: SessionID.__spec,
		cipher_suite: CipherSuite.__spec,
		compression_method: CompressionMethod.__spec
	}

	static readonly __bodySpecWithExtensions = extend(ServerHello.__bodySpec, {
		// TODO: TypedVector Extension extensions< 0..2^ 16 - 1 >;
	})

	constructor(
		public server_version: ProtocolVersion,
		public session_id: SessionID,
		public cipher_suite: CipherSuite,
		public compression_method: CompressionMethod,
		public extensions?: any
	) {
		super(
			HandshakeType.server_hello,
			extensions != undefined ? ServerHello.__bodySpecWithExtensions : ServerHello.__bodySpec
		);
	}

}

export class HelloVerifyRequest extends Handshake {

	static readonly __bodySpec = {
		server_version: ProtocolVersion.__spec,
		cookie: Cookie.__spec
	}


	constructor(
		public server_version: ProtocolVersion,
		public cookie: Cookie
	) {
		super(HandshakeType.hello_verify_request, HelloVerifyRequest.__bodySpec);
	}

}

export class ServerHelloDone extends Handshake {

	static readonly __bodySpec = {}

	constructor() {
		super(HandshakeType.server_hello_done, ServerHelloDone.__bodySpec);
	}

}


export class Finished extends Handshake {

	static readonly __bodySpec = {
		verify_data: new TLSTypes.Vector("uint8", 0, 2**16) // TODO: wirkliche Länge "verify_data_length" herausfinden
	}

	constructor(public verify_data: Buffer) {
		super(HandshakeType.finished, Finished.__bodySpec);
	}

}

