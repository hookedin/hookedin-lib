"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const private_key_1 = require("./private-key");
const public_key_1 = require("./public-key");
const POD = require("./pod");
const buffutils = require("./util/buffutils");
class Hookin {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('hookin expected an object');
        }
        const txid = buffutils.fromHex(data.txid, 32);
        if (txid instanceof Error) {
            return txid;
        }
        const vout = data.vout;
        if (!Number.isSafeInteger(vout) || vout < 0 || vout > 65536) {
            return new Error('hookin was given an invalid vout');
        }
        const amount = data.amount;
        if (!POD.isAmount(amount)) {
            return new Error('invalid amount for hookin');
        }
        const fee = data.fee;
        if (!POD.isAmount(fee)) {
            return new Error('invalid fee for hookin');
        }
        const claimant = public_key_1.default.fromPOD(data.claimant);
        if (claimant instanceof Error) {
            return claimant;
        }
        return new Hookin(txid, vout, amount, fee, claimant);
    }
    static hashOf(txid, vout, amount, fee, claimant) {
        const b = hash_1.default.newBuilder('Hookin');
        b.update(txid);
        b.update(buffutils.fromUint32(vout));
        b.update(buffutils.fromUint64(amount));
        b.update(buffutils.fromUint32(fee));
        b.update(claimant.buffer);
        return b.digest();
    }
    constructor(txid, vout, amount, fee, claimant) {
        this.txid = txid;
        this.vout = vout;
        this.amount = amount;
        this.fee = fee;
        this.claimant = claimant;
    }
    hash() {
        return Hookin.hashOf(this.txid, this.vout, this.amount, this.fee, this.claimant);
    }
    get kind() {
        return 'Hookin';
    }
    getTweak() {
        const bytes = hash_1.default.fromMessage('tweak', this.claimant.buffer).buffer;
        const pk = private_key_1.default.fromBytes(bytes);
        if (pk instanceof Error) {
            throw pk;
        }
        return pk;
    }
    toPOD() {
        return {
            hash: this.hash().toPOD(),
            amount: this.amount,
            claimant: this.claimant.toPOD(),
            fee: this.fee,
            txid: buffutils.toHex(this.txid),
            vout: this.vout,
        };
    }
}
exports.default = Hookin;
//# sourceMappingURL=hookin.js.map