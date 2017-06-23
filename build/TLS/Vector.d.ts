/// <reference types="node" />
import * as TypeSpecs from "./TypeSpecs";
import { ISerializable, DeserializationResult } from "./Serializable";
export declare class Vector<T extends number | ISerializable> extends Array<T> implements ISerializable {
    spec: TypeSpecs.Vector;
    constructor(source: T[], spec: TypeSpecs.Vector);
    readonly isVariableLength: boolean;
    serialize(): Buffer;
    private deserialize(buf, offset?);
    static from<T extends number | ISerializable>(spec: TypeSpecs.Vector, buf: Buffer, offset?: number): DeserializationResult<Vector<T>>;
}
