import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
import { extend } from "../lib/object-polyfill";
import { Random } from "./Random";
import { SessionID } from "./SessionID";
import { CipherSuite } from "./CipherSuite";
import { CompressionMethod } from "./CompressionMethod";
import { ProtocolVersion } from "./ProtocolVersion";

export abstract class Handshake extends TLSStruct {

	static readonly __spec = {
		msg_type: new TLSTypes.Enum("uint8", HandshakeType),
		length: new TLSTypes.Calculated("uint24", "serializedLength", "body")
	}

	constructor(
		public msg_type: HandshakeType,
		bodySpec: TLSTypes.StructSpec,
		initial?
	) {
		super(
			extend(Handshake.__spec, { body: bodySpec }),
			initial
		);
	}

	body: TLSStruct;

	get length() {
		// TODO: In TLSStruct einmalig definieren
		return this.getCalculatedPropertyValue("length");
	}

}


export enum HandshakeType {
	hello_request = 0,
	client_hello = 1,
	server_hello = 2,
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
		// TODO: Typed Vector CipherSuite cipher_suites< 1..2^ 15 - 1 >
		// TODO: Typed Vector CompressionMethod compression_methods< 1..2^ 8 - 1 >
	}

	static readonly __bodySpecWithExtensions = extend(ClientHello.__bodySpec, {
		// TODO: TypedVector Extension extensions< 0..2^ 16 - 1 >;
	})

	constructor(
		public client_version: ProtocolVersion,
		public session_id?: SessionID,
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

	constructor(public verify_data: number[]) {
		super(HandshakeType.finished, Finished.__bodySpec);
	}

}

