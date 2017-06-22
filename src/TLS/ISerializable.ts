export interface ISerializable<T> {

	serialize(): Buffer;
	deserialize(buf: Buffer, offset: number): T;

}