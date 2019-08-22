import Claimed from './claimed';
import Failed from './failed';
import BitcoinTransactionSent from './bitcoin-transaction-sent';
import InvoiceSettled from './invoice-settled';
import * as POD from '../pod';
declare type StatusType = Claimed | Failed | BitcoinTransactionSent | InvoiceSettled;
export default class Status {
    s: StatusType;
    constructor(s: StatusType);
    static fromPOD(obj: any): Status | Error;
    toPOD(): POD.Status;
    hash(): import("..").Hash;
    claimableHash(): import("..").Hash;
}
export {};
