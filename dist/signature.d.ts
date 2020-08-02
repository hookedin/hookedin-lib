import * as ecc from './util/ecc';
import PrivateKey from './private-key';
import PublicKey from './public-key';
export default class Signature {
    static compute(message: Uint8Array, privkey: PrivateKey): Signature;
    static fromPOD(data: any): Signature | Error;
    static fromBytes(bytes: Uint8Array): Signature | Error;
    r: ecc.Scalar;
    s: ecc.Scalar;
    constructor(r: ecc.Scalar, s: ecc.Scalar);
    get buffer(): Uint8Array;
    verify(message: Uint8Array, pubkey: PublicKey): boolean;
    verifyECDSA(message: Uint8Array, pubkey: PublicKey): boolean;
    toPOD(): string;
}
