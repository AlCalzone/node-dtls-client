import { TLSStruct } from "./TLSStruct";
export declare class ProtocolVersion extends TLSStruct {
    major: number;
    minor: number;
    static readonly __spec: {
        major: string;
        minor: string;
    };
    /**
     *
     * @param major - Hauptversionsnummer
     * @param minor - Nebenversionsnummer
     */
    constructor(major?: number, minor?: number);
}
