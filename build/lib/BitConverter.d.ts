/// <reference types="node" />
export declare type BitSizes = 8 | 16 | 24 | 32 | 48 | 64;
export declare type Vector = number[];
export declare type BitConverterResult<T> = {
    /** Das Ergebnis der BitConverter-Funktion */
    value: T;
    /** Die Anzahl an Bytes die gelesen bzw. geschrieben wurden */
    delta: number;
};
export declare function numberToBuffer(value: number, size: BitSizes): Buffer;
export declare function bufferToNumber(buf: Buffer, size: BitSizes, offset?: number): number;
