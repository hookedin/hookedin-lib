export declare function toHex(buff: Uint8Array): string;
export declare function fromHex(hexString: string): Uint8Array;
export declare function copy(buff: Uint8Array, target: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
export declare function slice(buff: Uint8Array, begin: number, end: number): Uint8Array;
export declare function concat(...buffs: Uint8Array[]): Uint8Array;
export declare function fromUint32(x: number): Uint8Array;
export declare function fromUint64(x: number): Uint8Array;
export declare function fromUint8(x: number): Uint8Array;
export declare function fromString(x: string): Uint8Array;
export declare function isAllZero(buff: Uint8Array): boolean;
export declare function compare(a: Uint8Array, b: Uint8Array): number;
export declare function constTimeEqual(a: Uint8Array, b: Uint8Array): boolean;