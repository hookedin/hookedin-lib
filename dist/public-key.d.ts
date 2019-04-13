import Hash from './hash';
import * as ecc from './util/ecc/elliptic';
export default class PublicKey {
    static fromPOD(data: any): PublicKey | Error;
    static fromBytes(serialized: Uint8Array): PublicKey | Error;
    x: ecc.Scalar;
    y: ecc.Scalar;
    readonly buffer: Uint8Array;
    constructor(x: ecc.Scalar, y: ecc.Scalar);
    toPOD(): string;
    tweak(n: PublicKey): PublicKey;
    derive(n: Uint8Array): PublicKey;
    hash(): Hash;
    toBitcoinAddress(testnet?: boolean): string;
}
