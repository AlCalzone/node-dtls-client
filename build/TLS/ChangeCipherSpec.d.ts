import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
export declare class ChangeCipherSpec extends TLSStruct {
    type: ChangeCipherSpecTypes;
    static readonly __spec: {
        type: TLSTypes.Enum;
    };
    constructor(type: ChangeCipherSpecTypes);
}
export declare enum ChangeCipherSpecTypes {
    change_cipher_spec = 1,
}
export declare namespace ChangeCipherSpecTypes {
    const __spec: TLSTypes.Enum;
}
