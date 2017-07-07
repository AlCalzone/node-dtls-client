# node-dtls-client

work in progress. DO NOT USE!


[DTLS](https://en.wikipedia.org/wiki/Datagram_Transport_Layer_Security) protocol implementation for Node.js written in TypeScript. This library provides the missing native DTLS support for Node.js client-side applications. It contains no server-side implementation.

Although great care has been taken to properly implement the required encryption and validation, there's no protection against well-known TLS attacks. Thus it is not advised to use it for security-critical applications. This libary's main goal is to allow using protocols that *require* DTLS.


## Roadmap
- [x] data types and conversion to/from buffers
- [x] HMAC, PRF and key computation
- [x] cipher suite definitions
- [x] record protocol implementation
  - [x] compression (no actual algorithms implemented)
  - [x] encryption and verification:
	  - [x] block ciphers
	  - [ ] stream ciphers (optional)
	  - [ ] *AEAD ciphers* (TODO: required for TRADFRI!)
  - [x] replay protection
- [x] handshake protocol implementation (usable with some exceptions)
  - [x] fragmentation and re-assembly
  - [x] change cipher spec
  - [x] handle message flow (retransmission still TODO)
  - [x] message definitions (all neccessary ones for TRADFRI)
- [ ] alert protocol implementation (optional for now)
- [ ] testing
  - [x] implement testing framework with code coverage
  - [ ] component tests 
  - [ ] manual tests with Tradfri Gateway
