# node-dtls-client

work in progress. DO NOT USE!


[DTLS](https://en.wikipedia.org/wiki/Datagram_Transport_Layer_Security) protocol implementation for Node.js written in TypeScript. This library provides the missing native DTLS support for Node.js client-side applications. It contains no server-side implementation.

Although great care has been taken to properly implement the required encryption and validation, there's no protection against well-known TLS attacks. Thus it is not advised to use it for security-critical applications. This libary's main goal is to allow using protocols that *require* DTLS.


## Roadmap
- [x] data types and conversion to/from buffers
- [x] HMAC, PRF and key computation
- [x] cipher suite definitions
- [ ] record protocol implementation
  - [x] compression (no actual algorithms implemented)
  - [x] encryption and verification:
    - [x] block ciphers
    - [ ] stream ciphers (optional)
    - [ ] AEAD ciphers (optional)
  - [x] replay protection
  - [ ] managing connection states
- [ ] change cipher suite protocol implementation
- [ ] handshake protocol implementation
  - [ ] extend TLSStruct:
    - [ ] support non-primitive vector items
	- [ ] support optional properties 
	- [ ] support parser function for vector items
  - [ ] handle message flow, including retransmission
  - [x] fragmentation and re-assembly
  - [ ] message definitions (~70%)
- [ ] alert protocol implementation (optional for now)
- [ ] testing
  - [x] implement testing framework with code coverage
  - [ ] tests
    - [x] /src/lib
    - [ ] /src/TLS (~5% done)
    - [ ] /src/DTLS
