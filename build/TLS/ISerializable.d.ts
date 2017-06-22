/// <reference types="node" />
export interface ISerializable<T> {
    serialize(): Buffer;
    deserialize(buf: Buffer, offset: number): T;
}
