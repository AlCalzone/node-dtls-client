# node-dtls-client

USE AT YOUR OWN RISK!


[DTLS](https://en.wikipedia.org/wiki/Datagram_Transport_Layer_Security) protocol implementation for Node.js written in TypeScript. 
This library provides the missing native DTLS support for Node.js client-side applications. It contains no server-side implementation.

Although great care has been taken to properly implement the required encryption and validation, 
there's no explicit protection against TLS attacks. Thus it is not advised to use it for security-critical applications. 
This libary's main goal is to allow using protocols that *require* DTLS.

## Usage

Establish a secure connection:
```
var dtls = require("node-dtls-client");

const socket = dtls
	// create a socket and initialize the secure connection
	.createSocket(options /* DtlsOptions */)
	// subscribe events
	.on("connected", () => {/* start sending data */})
	.on("error", (e /* Error */) => { })
	.on("message", (msg /* Buffer */) => { })
	.on("close", () => { })
	;
```

The DtlsOptions object looks as follows:
```
{
	type: "udp4",
	address: "ip or host",
	port: 5684,
	psk: { "psk_hint": "PSK" },
	timeout: 1000 // in ms, optional, minimum 100, default 1000
}
```

Send some data (after the `connected` event was received):
```
socket.send(data /* Buffer */, [callback]);
```

The events are defined as follows:
- `connected`: A secure connection has been established. Start sending data in the callback
- `error`: An error has happened. This usually means the handshake was not successful
- `message`: The socket received some data.
- `close`: The connection was closed successfully.



## Missing features:
- [ ] alert protocol implementation (optional for now)
- [ ] cipher suites with non-PSK key exchange algorithms: dhe_dss | dhe_rsa | rsa | dh_dss | dh_rsa | dhe_psk | rsa_psk
- [ ] packet retransmission
- [ ] session renegotiation
- [ ] other compression algorithms except NULL


## Changelog

#### 0.1.0 (2015-08-23)
* (AlCalzone) publish to npm

#### 0.0.3 (2015-08-09)
* (AlCalzone) bugfixes

#### 0.0.2 (2015-08-01)
* (AlCalzone) improved error and timeout handling in the socket wrapper.

#### 0.0.1
* (AlCalzone) initial release. 


## License
The MIT License (MIT)

Copyright (c) 2017 AlCalzone <d.griesel@gmx.net>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
