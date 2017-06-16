import { CipherSuite } from "../TLS/CipherSuite";
export interface ICipherSuites {
    [name: string]: CipherSuite;
}
export declare const CipherSuites: ICipherSuites;
