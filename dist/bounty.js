"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const address_1 = require("./address");
const assert = require("./util/assert");
const Buffutils = require("./util/buffutils");
const POD = require("./pod");
class Bounty {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('Bounty was expected to be an object');
        }
        const amount = data.amount;
        if (!POD.isAmount(amount)) {
            return new Error('Bounty should be a positive integer');
        }
        const claimant = address_1.default.fromPOD(data.claimant);
        if (claimant instanceof Error) {
            return claimant;
        }
        const nonce = Buffutils.fromHex(data.nonce, 32);
        if (nonce instanceof Error) {
            return nonce;
        }
        return new Bounty(amount, claimant, nonce);
    }
    constructor(amount, claimant, nonce) {
        this.amount = amount;
        this.claimant = claimant;
        assert.equal(nonce.length, 32);
        this.nonce = nonce;
    }
    toPOD() {
        return {
            amount: this.amount,
            claimant: this.claimant.toPOD(),
            nonce: Buffutils.toHex(this.nonce),
        };
    }
    hash() {
        const h = hash_1.default.newBuilder('Bounty');
        h.update(Buffutils.fromUint64(this.amount));
        h.update(this.claimant.buffer);
        h.update(this.nonce);
        return h.digest();
    }
}
exports.default = Bounty;
//# sourceMappingURL=bounty.js.map