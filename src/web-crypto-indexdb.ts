import {
  decode,
  decryptValue,
  deriveCryptKey,
  encryptValue,
  generateBaseCryptoKey,
  generateHash,
  generateSalt,
  TypedArray,
} from '@webcrypto/tools';
import { get, set } from 'idb-keyval';

export type InputData = string | TypedArray;

export class CryptoStorage {
  cryptoBaseKey: Promise<CryptoKey>;

  constructor(baseKey: InputData) {
    this.cryptoBaseKey = generateBaseCryptoKey(baseKey);
  }

  load(key: InputData) {
    return Promise.all([this.cryptoBaseKey, this.getSalt()])
      .then(([cryptoBaseKey, salt]) =>
        Promise.all([
          deriveCryptKey(cryptoBaseKey, salt),
          generateHash(key).then(hashKey => get<TypedArray>(hashKey)),
          generateHash(key + '-nonce').then(hashNonce => get<TypedArray>(hashNonce)),
        ]),
      )
      .then(([cryptoKey, value, nonce]) =>
        value ? decryptValue(value, cryptoKey, nonce) : new Uint16Array(),
      )
      .then(decode)
      .catch(_ => {
        throw new Error('Integrity/Authenticity check failed!');
      });
  }

  save(key: InputData, value: InputData) {
    return Promise.all([this.cryptoBaseKey, this.getSalt()])
      .then(([cryptoBaseKey, salt]) => deriveCryptKey(cryptoBaseKey, salt))
      .then(cryptoKey =>
        Promise.all([
          encryptValue(value, cryptoKey),
          generateHash(key),
          generateHash(key + '-nonce'),
        ]),
      )
      .then(([[cryptoValue, nonce], hashKey, hashNonce]) =>
        Promise.all([set(hashKey, cryptoValue), set(hashNonce, nonce)]),
      );
  }

  private getSalt() {
    return generateHash('salt')
      .then(hash => get<TypedArray>(hash).then(salt => [hash, salt]))
      .then(([hash, salt]) => {
        const asd = salt || this.createSalt(hash);
        return asd;
      });
  }

  private createSalt(saltHash: TypedArray) {
    const newSalt = generateSalt();
    set(saltHash, newSalt);
    return newSalt;
  }
}
