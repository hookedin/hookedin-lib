import BlindedMessage from './blinded-message';
import Hookin from './hookin';
import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';
import Magnitude from './magnitude';

import ClaimRequest, { CoinClaim } from './claim-request';

export default class ClaimHookinRequest {
  public static newAuthorized(claimantPrivateKey: PrivateKey, claim: Hookin, coins: CoinClaim[]) {
    const hash = ClaimRequest.hashOf(claim.hash(), coins);
    const authorization = Signature.compute(hash.buffer, claimantPrivateKey);

    return new ClaimHookinRequest(claim, coins, authorization);
  }

  public static fromPOD(data: any): ClaimHookinRequest | Error {
    if (typeof data !== 'object') {
      return new Error('ClaimHookinRequest.fromPOD expected an object');
    }

    const claim = Hookin.fromPOD(data.claim);
    if (claim instanceof Error) {
      return claim;
    }

    if (!Array.isArray(data.coins)) {
      return new Error('ClaimHookinRequest expected an array of coins');
    }

    const coins = [];
    for (const coin of data.coins) {
      const blindingNonce = PublicKey.fromPOD(coin.blindingNonce);
      if (blindingNonce instanceof Error) {
        return blindingNonce;
      }

      const blindedOwner = BlindedMessage.fromPOD(coin.blindedOwner);
      if (blindedOwner instanceof Error) {
        return blindedOwner;
      }

      const magnitude = Magnitude.fromPOD(coin.magnitude);
      if (magnitude instanceof Error) {
        return magnitude;
      }

      coins.push({ blindingNonce, blindedOwner, magnitude });
    }

    const authorization = Signature.fromPOD(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new ClaimHookinRequest(claim, coins, authorization);
  }

  public claim: Hookin;
  public coins: CoinClaim[];
  public authorization: Signature;

  constructor(claim: Hookin, coins: CoinClaim[], authorization: Signature) {
    this.claim = claim;
    this.coins = coins;
    this.authorization = authorization;
  }

  public prune(): ClaimRequest {
    return new ClaimRequest(this.claim.hash(), this.coins, this.authorization);
  }

  public hash(): Hash {
    return ClaimRequest.hashOf(this.claim.hash(), this.coins);
  }

  public toPOD(): POD.ClaimHookinRequest {
    return {
      authorization: this.authorization.toPOD(),
      claim: this.claim.toPOD(),
      coins: this.coins.map(coin => ({
        blindingNonce: coin.blindingNonce.toPOD(),
        blindedOwner: coin.blindedOwner.toPOD(),
        magnitude: coin.magnitude.toPOD(),
      })),
    };
  }
}