"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RecordLayer = (function () {
    function RecordLayer() {
    }
    Object.defineProperty(RecordLayer, "MAX_PAYLOAD_SIZE", {
        get: function () { return RecordLayer.MTU - RecordLayer.MTU_OVERHEAD; },
        enumerable: true,
        configurable: true
    });
    return RecordLayer;
}());
// TODO: mal sehen, ob das nicht woanders besser aufgehoben ist
/**
 * Maximum transfer unit of the underlying connection.
 * Note: Ethernet supports up to 1500 bytes, of which 20 bytes are reserved for the IP header and 8 for the UDP header
 */
RecordLayer.MTU = 1280;
RecordLayer.MTU_OVERHEAD = 20 + 8;
exports.RecordLayer = RecordLayer;
//# sourceMappingURL=RecordLayer.js.map