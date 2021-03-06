"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const ecc = require("./util/ecc/elliptic");
const bech32 = require("./util/bech32");
const ripemd160_1 = require("./util/bcrypto/ripemd160");
const sha256_1 = require("./util/bcrypto/sha256");
const buffutils = require("./util/buffutils");
const _1 = require(".");
const mu_sig_1 = require("./util/ecc/mu-sig");
const base58_1 = require("./util/base58");
const serializedPrefix = 'pubmp'; // public key moneypot
class PublicKey {
    // dont directly use...
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static fromPOD(data) {
        if (typeof data !== 'string') {
            return new Error('PublicKey.fromPOD expected a string');
        }
        const { prefix, words } = bech32.decode(data);
        if (prefix !== serializedPrefix) {
            return new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
        }
        return PublicKey.fromBytes(bech32.fromWords(words));
    }
    static fromBytes(serialized) {
        const point = ecc.Point.fromBytes(serialized);
        if (point instanceof Error) {
            return point;
        }
        return new PublicKey(point.x, point.y);
    }
    static combine(pubkeys) {
        const t = mu_sig_1.pubkeyCombine(pubkeys);
        return new PublicKey(t.x, t.y);
    }
    get buffer() {
        return ecc.Point.toBytes(this);
    }
    toPOD() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
    }
    tweak(n) {
        const newQ = ecc.pointAdd(this, n);
        return new PublicKey(newQ.x, newQ.y);
    }
    derive(n) {
        let nBuff;
        if (n instanceof Uint8Array) {
            nBuff = n;
        }
        else if (typeof n === 'bigint') {
            nBuff = _1.Buffutils.fromBigInt(n);
        }
        else if (typeof n === 'number') {
            nBuff = _1.Buffutils.fromVarInt(n);
        }
        else {
            throw new Error('unexpected type for deriving with. must be a Uint8Array | number | bigint');
        }
        const tweakBy = hash_1.default.fromMessage('derive', this.buffer, nBuff).buffer;
        const tweakByN = ecc.Scalar.fromBytes(tweakBy);
        if (tweakByN instanceof Error) {
            throw tweakByN;
        }
        const tweakPoint = ecc.Point.fromPrivKey(tweakByN);
        const newQ = ecc.pointAdd(this, tweakPoint);
        return new PublicKey(newQ.x, newQ.y);
    }
    hash() {
        return hash_1.default.fromMessage('PublicKey', this.buffer);
    }
    toBitcoinAddress(testnet = true) {
        const prefix = testnet ? 'tb' : 'bc';
        const pubkeyHash = rmd160sha256(this.buffer);
        const words = bech32.toWords(pubkeyHash);
        const version = new Uint8Array(1); // [0]
        return bech32.encode(prefix, buffutils.concat(version, words));
    }
    toNestedBitcoinAddress(testnet = true) {
        const prefix = testnet ? 0xc4 : 0x05;
        const pubkeyHash = rmd160sha256(this.buffer);
        // redeem script
        const redeem = rmd160sha256(buffutils.concat(new Uint8Array([0x00, 0x14]), pubkeyHash));
        // const rmdsha =  rmd160sha256(redeem)
        const addbytes = buffutils.concat(new Uint8Array([prefix]), redeem);
        const sha2 = sha256_1.default.digest(sha256_1.default.digest(addbytes)).slice(0, 4);
        // const checksum = sha2.slice(0, 4)
        const binary = buffutils.concat(addbytes, sha2);
        return base58_1.encode(binary);
    }
    toLegacyBitcoinAddress(testnet = false) {
        const prefix = testnet ? 0x6f : 0x00;
        const hash = rmd160sha256(this.buffer);
        const concatVersion = buffutils.concat(new Uint8Array([prefix]), hash);
        const sha = sha256_1.default.digest(sha256_1.default.digest(concatVersion)).slice(0, 4);
        const enc = buffutils.concat(concatVersion, sha);
        return base58_1.encode(enc);
    }
}
exports.default = PublicKey;
function rmd160sha256(data) {
    return ripemd160_1.default.digest(sha256_1.default.digest(data));
}
//# sourceMappingURL=public-key.js.map