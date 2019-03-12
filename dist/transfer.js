"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const signature_1 = require("./signature");
class Transfer {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('expected an object to deserialize a Transfer');
        }
        const input = hash_1.default.fromBech(data.input);
        if (input instanceof Error) {
            return input;
        }
        const output = hash_1.default.fromBech(data.output);
        if (output instanceof Error) {
            return output;
        }
        const authorization = signature_1.default.fromBech(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new Transfer(input, output, authorization);
    }
    constructor(input, output, authorization) {
        this.input = input;
        this.output = output;
        this.authorization = authorization;
    }
    static hashOf(input, output) {
        const h = hash_1.default.newBuilder('Transfer');
        h.update(input.buffer);
        h.update(output.buffer);
        return h.digest();
    }
    hash() {
        return Transfer.hashOf(this.input, this.output);
    }
    toPOD() {
        return {
            authorization: this.authorization.toBech(),
            input: this.input.toBech(),
            output: this.output.toBech(),
        };
    }
}
exports.default = Transfer;
//# sourceMappingURL=transfer.js.map