/// <reference types="node" />
import * as TypeSpecs from "./TypeSpecs";
import { ISerializable, DeserializationResult } from "./Serializable";
export declare class Vector<T extends number | ISerializable> {
    items: T[];
    constructor(items?: T[]);
    serialize(spec: TypeSpecs.Vector): Buffer;
    private deserialize(spec, buf, offset?);
    static from<T extends number | ISerializable>(spec: TypeSpecs.Vector, buf: Buffer, offset?: number): DeserializationResult<Vector<T>>;
    static createFromBuffer(buf: Buffer): Vector<number>;
}
