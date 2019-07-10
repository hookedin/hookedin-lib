import * as assert from './assert';
import * as types from './types';

export function toHex(buff: Uint8Array) {
  let result = '';

  for (let i = 0; i < buff.length; i++) {
    const value = buff[i].toString(16);
    result += value.length === 1 ? '0' + value : value;
  }

  return result;
}

export function fromHex(hexString: any, expectedLength: number = 0): Uint8Array | Error {
  if (typeof hexString !== 'string') {
    return new Error('hexString must actually be hex');
  }

  // TODO: check for invalid chars
  const buff = new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

  if (expectedLength > 0 && buff.length !== expectedLength) {
    return new Error('unexpected length in hex string');
  }

  return buff;
}

// returns amount of bytes copied. Does not support partial copies (i.e. target must be big enough)
export function copy(
  buff: Uint8Array,
  target: Uint8Array,
  targetStart: number = 0,
  sourceStart: number = 0,
  sourceEnd: number = buff.length
) {
  assert.is(buff, Uint8Array);
  assert.is(target, Uint8Array);

  // TODO: this can be optimized with .set
  for (let i = 0; i < sourceEnd - sourceStart; i++) {
    target[i + targetStart] = buff[i + sourceStart];
  }

  return sourceEnd - sourceStart;
}

export function slice(buff: Uint8Array, begin: number = 0, end: number = buff.length) {
  assert.is(buff, Uint8Array);
  if (begin < 0) {
    begin = Math.max(buff.length + begin, 0);
  }

  return new Uint8Array(buff.buffer, buff.byteOffset + begin, end - begin);
}

export function concat(...buffs: Uint8Array[]) {
  let totalSize = 0;
  for (let i = 0; i < buffs.length; i++) {
    assert.is(buffs[i], Uint8Array);
    totalSize += buffs[i].length;
  }

  const res = new Uint8Array(totalSize);
  let writeAt = 0;
  for (let i = 0; i < buffs.length; i++) {
    res.set(buffs[i], writeAt);
    writeAt += buffs[i].length;
  }

  return res;
}

export function fromUint32(x: number) {
  assert.check(types.isUint32, x);

  const buff = new ArrayBuffer(4);
  const view = new DataView(buff);
  view.setUint32(0, x);

  return new Uint8Array(buff);
}

export function fromUint64(x: number) {
  assert.check(types.isUint64, x);

  const buff = new ArrayBuffer(8);
  const view = new DataView(buff);

  const big = ~~(x / 0x0100000000);
  const low = x % 0x0100000000;

  view.setUint32(0, big);
  view.setUint32(4, low);

  return new Uint8Array(buff);
}

export function fromUint8(x: number) {
  assert.check(types.isUint8, x);

  const buff = new Uint8Array(1);
  buff[0] = x;
  return buff;
}

export function fromVarInt(n: number) {
  return fromBigInt(BigInt(n));
}

export function fromBigInt(n: bigint): Uint8Array {
  const out = [];
  const base = BigInt(256);
  while (n >= base) {
    out.push(Number(n % base));
    n = n / base;
  }
  out.push(Number(n));

  const buf = new Uint8Array(out.length);
  buf.set(out.reverse());
  return buf;
}

export function toBigInt(bytes: Uint8Array): bigint {
  let result = BigInt(0);
  const n = bytes.length;

  // Read input in 8 byte slices
  if (n >= 8) {
    const view = new DataView(bytes.buffer, bytes.byteOffset);

    for (let i = 0, k = n & ~7; i < k; i += 8) {
      const x = view.getBigUint64(i, false);
      result = (result << BigInt(64)) + x;
    }
  }

  // Mop up any remaining bytes
  for (let i = n & ~7; i < n; i++) {
    result = result * BigInt(256) + BigInt(bytes[i]);
  }

  return result;
}

export function fromString(x: string) {
  assert.check(types.isString, x);

  return new TextEncoder().encode(x);
}

export function toString(x: Uint8Array) {
  return new TextDecoder().decode(x);
}

export function isAllZero(buff: Uint8Array) {
  for (let i = 0; i < buff.length; i++) {
    if (buff[i] !== 0) {
      return false;
    }
  }
  return true;
}

export function compare(a: Uint8Array, b: Uint8Array) {
  assert.is(a, Uint8Array);
  assert.is(b, Uint8Array);

  const m = Math.min(a.length, b.length);

  for (let i = 0; i < m; i++) {
    const r = a[i] - b[i];
    if (r !== 0) {
      return r;
    }
  }

  if (a.length < b.length) {
    return -1;
  }

  if (b.length < a.length) {
    return 1;
  }

  return 0;
}

export function equal(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

// only constant time if both arrays are the same length
export function constTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) {
    return false;
  }
  let equal = true;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      equal = false; // don't abort early, hopefully the optimizer won't realize it can LOL
    }
  }

  return equal;
}
