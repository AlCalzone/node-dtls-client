import * as TypeSpecs from "./TypeSpecs";
import { Vector } from "../TLS/Vector";
export declare namespace SessionID {
    const spec: TypeSpecs.Vector;
    function createNew(items?: number[]): Vector<number>;
}
