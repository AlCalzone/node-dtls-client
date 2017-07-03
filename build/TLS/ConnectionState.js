"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TypeSpecs = require("./TypeSpecs");
var object_polyfill_1 = require("../lib/object-polyfill");
var PRF_1 = require("./PRF");
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
    Object.defineProperty(ConnectionState.prototype, "OutgoingMac", {
        get: function () {
            if (this._outgoingMac == undefined)
                this._outgoingMac = this.cipherSuite.specifyMAC(this.key_material, this.entity);
            return this._outgoingMac;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionState.prototype, "IncomingMac", {
        get: function () {
            if (this._incomingMac == undefined)
                this._incomingMac = this.cipherSuite.specifyMAC(this.key_material, this.entity === "client" ? "server" : "client");
            return this._incomingMac;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Compute the master secret from a given premaster secret
     * @param preMasterSecret - The secret used to calculate the master secret
     * @param clientHelloRandom - The random data from the client hello message
     * @param serverHelloRandom - The random data from the server hello message
     */
    ConnectionState.prototype.computeMasterSecret = function (preMasterSecret) {
        this.master_secret = PRF_1.PRF[this.cipherSuite.prfAlgorithm](preMasterSecret.serialize(), "master secret", Buffer.concat([this.client_random, this.server_random]), master_secret_length);
    };
    /**
     * Berechnet die Schlüsselkomponenten
     */
    ConnectionState.prototype.computeKeyMaterial = function () {
        var keyBlock = PRF_1.PRF[this.cipherSuite.prfAlgorithm](this.master_secret, "key expansion", Buffer.concat([this.server_random, this.client_random]), 2 * (this.cipherSuite.MAC.length + this.cipherSuite.Cipher.keyLength + this.fixed_iv_length));
        var offset = 0;
        function read(length) {
            var ret = keyBlock.slice(offset, offset + length);
            offset += length;
            return ret;
        }
        this.key_material = {
            client_write_MAC_key: read(this.cipherSuite.MAC.length),
            server_write_MAC_key: read(this.cipherSuite.MAC.length),
            client_write_key: read(this.cipherSuite.Cipher.keyLength),
            server_write_key: read(this.cipherSuite.Cipher.keyLength),
            client_write_IV: read(this.fixed_iv_length),
            server_write_IV: read(this.fixed_iv_length)
        };
    };
    return ConnectionState;
}());
exports.ConnectionState = ConnectionState;
//# sourceMappingURL=ConnectionState.js.map