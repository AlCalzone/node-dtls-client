import * as TLSTypes from "./TLSTypes";
export declare enum ContentType {
    change_cipher_spec = 20,
    alert = 21,
    handshake = 22,
    application_data = 23,
}
export declare namespace ContentType {
    const __spec: TLSTypes.Enum;
}
