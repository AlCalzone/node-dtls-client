"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TypeSpecs = require("./TypeSpecs");
var object_polyfill_1 = require("../lib/object-polyfill");
var PRF_1 = require("./PRF");
var CipherSuites_1 = require("../DTLS/CipherSuites");
var CompressionMethod;
(function (CompressionMethod) {
    CompressionMethod[CompressionMethod["null"] = 0] = "null";
})(CompressionMethod = exports.CompressionMethod || (exports.CompressionMethod = {}));
(function (CompressionMethod) {
    CompressionMethod.spec = TypeSpecs.define.Enum("uint8", CompressionMethod);
})(CompressionMethod = exports.CompressionMethod || (exports.CompressionMethod = {}));
var master_secret_length = 48;
var client_random_length = 32;
var server_random_length = 32;
var ConnectionState = (function () {
    function ConnectionState(values) {
        this.entity = "client";
        this.cipherSuite = CipherSuites_1.CipherSuites.TLS_NULL_WITH_NULL_NULL;
        //prf_algorithm: HashAlgorithm;
        //bulk_cipher_algorithm: BulkCipherAlgorithm;
        //cipher_type: CipherType;
        //enc_key_length: number;
        //block_length: number;
        //fixed_iv_length: number; // TODO: put it into cipher suite?
        //record_iv_length: number;
        //mac_algorithm: HashAlgorithm;
        //mac_length: number;
        //mac_key_length: number;
        this.compression_algorithm = CompressionMethod.null;
        if (values) {
            for (var _i = 0, _a = object_polyfill_1.entries(values); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                if (this.hasOwnProperty(key))
                    this[key] = value;
            }
        }
    }
    Object.defineProperty(ConnectionState.prototype, "Cipher", {
        get: function () {
            if (this._cipher == undefined)
                this._cipher = this.cipherSuite.specifyCipher(this.key_material, this.entity);
            return this._cipher;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionState.prototype, "Decipher", {
        get: function () {
            if (this._decipher == undefined)
                this._decipher = this.cipherSuite.specifyDecipher(this.key_material, this.entity);
            return this._decipher;
        },
        enumerable: true,
        configurable: true
    });
    // private _outgoingMac: MacDelegate;
    // public get OutgoingMac(): MacDelegate {
    // 	if (this._outgoingMac == undefined)
    // 		this._outgoingMac = this.cipherSuite.specifyMAC(this.key_material, this.entity);
    // 	return this._outgoingMac;
    // }
    // private _incomingMac: MacDelegate;
    // public get IncomingMac(): MacDelegate {
    // 	if (this._incomingMac == undefined)
    // 		this._incomingMac = this.cipherSuite.specifyMAC(this.key_material, this.entity === "client" ? "server" : "client");
    // 	return this._incomingMac;
    // }
    /**
     * Compute the master secret from a given premaster secret
     * @param preMasterSecret - The secret used to calculate the master secret
     * @param clientHelloRandom - The random data from the client hello message
     * @param serverHelloRandom - The random data from the server hello message
     */
    ConnectionState.prototype.computeMasterSecret = function (preMasterSecret) {
        this.master_secret = PRF_1.PRF[this.cipherSuite.prfAlgorithm](preMasterSecret.serialize(), "master secret", Buffer.concat([this.client_random, this.server_random]), master_secret_length);
        // now we can compute the key material
        this.computeKeyMaterial();
    };
    /**
     * Berechnet die Schlüsselkomponenten
     */
    ConnectionState.prototype.computeKeyMaterial = function () {
        var keyBlock = PRF_1.PRF[this.cipherSuite.prfAlgorithm](this.master_secret, "key expansion", Buffer.concat([this.server_random, this.client_random]), 2 * (this.cipherSuite.MAC.keyAndHashLength + this.cipherSuite.Cipher.keyLength + this.cipherSuite.Cipher.fixedIvLength));
        var offset = 0;
        function read(length) {
            var ret = keyBlock.slice(offset, offset + length);
            offset += length;
            return ret;
        }
        this.key_material = {
            client_write_MAC_key: read(this.cipherSuite.MAC.keyAndHashLength),
            server_write_MAC_key: read(this.cipherSuite.MAC.keyAndHashLength),
            client_write_key: read(this.cipherSuite.Cipher.keyLength),
            server_write_key: read(this.cipherSuite.Cipher.keyLength),
            client_write_IV: read(this.cipherSuite.Cipher.fixedIvLength),
            server_write_IV: read(this.cipherSuite.Cipher.fixedIvLength)
        };
    };
    return ConnectionState;
}());
exports.ConnectionState = ConnectionState;
//# sourceMappingURL=ConnectionState.js.map