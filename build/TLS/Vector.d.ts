/// <reference types="node" />
import * as TLSTypes from "./TLSTypes";
import { ISerializable } from "./ISerializable";
export declare class Vector<T extends TLSTypes.Numbers | ISerializable<T>> extends Array<T> implements ISerializable<T> {
    minLength: number;
    maxLength: number;
    optional: boolean;
    constructor(source: T[], minLength?: number, maxLength?: number, optional?: boolean);
    readonly isVariableLength: boolean;
    serialize(): Buffer;
    deserialize(buf: Buffer, offset: number): T;
}
