/// <reference types="node" />
import * as TypeSpecs from "./TypeSpecs";
import { ISerializable, DeserializationResult } from "./Serializable";
export declare class Vector<T extends number | ISerializable> {
    spec: TypeSpecs.Vector;
    items: T[];
    constructor(spec: TypeSpecs.Vector, items?: T[]);
    serialize(): Buffer;
    private deserialize(buf, offset?);
    static from<T extends number | ISerializable>(spec: TypeSpecs.Vector, buf: Buffer, offset?: number): DeserializationResult<Vector<T>>;
    readonly isVariableLength: boolean;
}
