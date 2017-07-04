import * as TypeSpecs from "../TLS/TypeSpecs";
import { Vector } from "../TLS/Vector";
export declare namespace Cookie {
    const spec: TypeSpecs.Vector;
    function createNew(items?: number[]): Vector<number>;
}
