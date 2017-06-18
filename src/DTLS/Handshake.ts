import * as TLSTypes from "../TLS/TLSTypes";
import { TLSStruct } from "../TLS/TLSStruct";
import { extend } from "../lib/object-polyfill";
import { Random } from "../TLS/Random";
import { SessionID } from "../TLS/SessionID";
import { Cookie } from "./Cookie";
import { CipherSuite } from "../TLS/CipherSuite";
import { CompressionMethod } from "../TLS/CompressionMethod";
import { ProtocolVersion } from "../TLS/ProtocolVersion";

export abstract class Handshake extends TLSStruct {

	// TODO: zusätzliche Parameter automatisch oder manuell ausfüllen
	static readonly __spec = {
		msg_type: new TLSTypes.Enum("uint8", HandshakeType),
		length: "uint24", // can be calculated somehow?
		message_seq: "uint16",
		fragment_offset: "uint24",
		fragment_length: "uint24" //new TLSTypes.Calculated("uint24", "serializedLength", "body") // TODO: Add fragmentation support
	}

	constructor(
		public msg_type: HandshakeType,
		public length: number,
		public message_seq: number,
		public fragment_offset: number,
		public fragment_length: number,
		bodySpec: TLSTypes.StructSpec,
		initial?
	) {
		super(
			extend(Handshake.__spec, { body: bodySpec }),
			initial
		);
	}

	public body: TLSStruct;
	
	// Implementation details:
	// message_seq starts at 0 for both client and server during the handshake. 
	// Each new (not retransmitted) message increases the value by 1.

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
		// TODO: TypedVector Extension extensions< 0..2^ 16 - 1 >;
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

