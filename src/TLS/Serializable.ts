// maybe this can be done with this syntax:
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html

type Constructor<T> = new(...args: any[]) => T;

function Serializable<T extends Constructor<{}>>(Base: T) {
    return abstract class extends Base {
        _tag: string;
        constructor(...args: any[]) {
            super(...args);
            this._tag = "";
        }
    }
}

export abstract class Serializable<T> {

	serialize(): Buffer {};
	static deserialize(buf: Buffer, offset: number): T {};

}