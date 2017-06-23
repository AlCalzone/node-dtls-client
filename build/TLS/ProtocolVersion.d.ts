import { TLSStruct } from "./TLSStruct";
import * as TypeSpecs from "./TypeSpecs";
export declare class ProtocolVersion extends TLSStruct {
    major: number;
    minor: number;
    static readonly __spec: {
        major: TypeSpecs.Number;
        minor: TypeSpecs.Number;
    };
    /**
     *
     * @param major - Hauptversionsnummer
     * @param minor - Nebenversionsnummer
     */
    constructor(major?: number, minor?: number);
}
