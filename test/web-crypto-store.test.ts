import { generateBaseCryptoKey } from '@webcrypto/tools';

import { CryptoStorage } from '../src/web-crypto-store';
import { getErrorMessage, indexDbSearch, setupSubjectList } from './tools';

declare global {
  interface IDBFactory {
    databases: () => Promise<{ name: string; version: number }[]>;
  }
}

const { registerSubject, clearSubjects } = setupSubjectList();

describe('Web Crypto IndexDB', () => {
  afterEach(async () => {
    await clearSubjects();
  });

  describe('when saving data', () => {
    it('should not be able to save data without a crypto key', async () => {
      const init = async () => {
        const subject = new CryptoStorage(undefined as any);
        await subject.save('any key', 'any data');
      };
      expect(await getErrorMessage(init())).toBe(CryptoStorage.CryptoKeyError);
    });

    it('should not be able to save data without a crypto key when using a object config', async () => {
      const init = async () => {
        const subject = new CryptoStorage({ baseKey: undefined as any });
        await subject.save('any key', 'any data');
      };
      expect(await getErrorMessage(init())).toBe(CryptoStorage.CryptoKeyError);
    });

    it('should be able to save data with a raw crypto key', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      await subject.save('any key', 'any value');
      const result = await indexDbSearch(subject, { anyData: true });
      expect(result).toBeTrue();
    });

    it('should be able to save data with a crypto key', async () => {
      const cryptoKey = await generateBaseCryptoKey('raw key');
      const subject = registerSubject(new CryptoStorage(cryptoKey));
      await subject.save('any key', 'any value');
      const result = await indexDbSearch(subject, { anyData: true });
      expect(result).toBeTrue();
    });

    it('should not save the raw key', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      const key = 'any key';
      await subject.save(key, 'any value');
      const result = await indexDbSearch(subject, { key });
      expect(result).toBeFalse();
    });

    it('should not save the raw value', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      const value = 'any value';
      await subject.save('any key', value);
      const result = await indexDbSearch(subject, { value });
      expect(result).toBeFalse();
    });

    it('should not use the raw data base name', async () => {
      const dbName = 'any db';
      const subject = registerSubject(new CryptoStorage('raw key', dbName));
      await subject.save('any key', 'any value');
      const result = await indexDbSearch(subject, { dbName });
      expect(result).toBeFalse();
    });

    it('should not use the raw table name', async () => {
      const storeName = 'any db';
      const subject = registerSubject(new CryptoStorage('raw key', undefined, storeName));
      await subject.save('any key', 'any value');
      const result = await indexDbSearch(subject, { storeName });
      expect(result).toBeFalse();
    });

    it('should not use the raw data base name with object constructor', async () => {
      const dbName = 'any db';
      const subject = registerSubject(new CryptoStorage({ baseKey: 'raw key', dbName }));
      await subject.save('any key', 'any value');
      const result = await indexDbSearch(subject, { dbName });
      expect(result).toBeFalse();
    });

    it('should not use the raw table name with object constructor', async () => {
      const storeName = 'any db';
      const subject = registerSubject(new CryptoStorage({ baseKey: 'raw key', storeName }));
      await subject.save('any key', 'any value');
      const result = await indexDbSearch(subject, { storeName });
      expect(result).toBeFalse();
    });
  });

  describe('when loading data', () => {
    it('should get the original value', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      const key = 'any key';
      const originalValue = 'any value';
      await subject.save(key, originalValue);
      expect(await subject.load(key)).toBe(originalValue);
    });

    it('should get the original value in another instance with same key', async () => {
      const cryptoKey = 'same raw key';
      const key = 'any key';
      const originalValue = 'any value';
      let subject = registerSubject(new CryptoStorage(cryptoKey));
      await subject.save(key, originalValue);
      subject = registerSubject(new CryptoStorage(cryptoKey));
      expect(await subject.load(key)).toBe(originalValue);
    });

    it('should get the original value in another instance with same key and db name', async () => {
      const cryptoKey = 'same raw key';
      const dbName = 'same db name';
      const key = 'any key';
      const originalValue = 'any value';
      let subject = registerSubject(new CryptoStorage(cryptoKey, dbName));
      await subject.save(key, originalValue);
      subject = registerSubject(new CryptoStorage(cryptoKey, dbName));
      expect(await subject.load(key)).toBe(originalValue);
    });

    it('should get the original value in another instance with same key, db name and store name', async () => {
      const cryptoKey = 'same raw key';
      const dbName = 'same db name';
      const storeName = 'same store name';
      const key = 'any key';
      const originalValue = 'any value';
      let subject = registerSubject(new CryptoStorage(cryptoKey, dbName, storeName));
      await subject.save(key, originalValue);
      subject = registerSubject(new CryptoStorage(cryptoKey, dbName, storeName));
      expect(await subject.load(key)).toBe(originalValue);
    });

    it('should get the original value in another instance with same key, db name, store name and salt', async () => {
      const cryptoKey = 'same raw key';
      const dbName = 'same db name';
      const storeName = 'same store name';
      const salt = new Uint8Array([1, 3, 9]);
      const key = 'any key';
      const originalValue = 'any value';
      let subject = registerSubject(new CryptoStorage(cryptoKey, dbName, storeName, salt));
      await subject.save(key, originalValue);
      subject = registerSubject(new CryptoStorage(cryptoKey, dbName, storeName, salt));
      expect(await subject.load(key)).toBe(originalValue);
    });

    it('should get the original value in another instance with same key, db name, store name, salt and interactions', async () => {
      const cryptoKey = 'same raw key';
      const dbName = 'same db name';
      const storeName = 'same store name';
      const salt = new Uint8Array([1, 3, 9]);
      const interactions = 123;
      const key = 'any key';
      const originalValue = 'any value';
      let subject = registerSubject(
        new CryptoStorage(cryptoKey, dbName, storeName, salt, interactions),
      );
      await subject.save(key, originalValue);
      subject = registerSubject(
        new CryptoStorage(cryptoKey, dbName, storeName, salt, interactions),
      );
      expect(await subject.load(key)).toBe(originalValue);
    });

    it('should not be able to load data stored with a different key', async () => {
      let subject = registerSubject(new CryptoStorage('first key'));
      const key = 'any key';
      const originalValue = 'any value';
      await subject.save(key, originalValue);
      subject = registerSubject(new CryptoStorage('another key'));
      expect(await getErrorMessage(subject.load(key))).toBe(CryptoStorage.AuthenticityError);
    });

    it('should not get values from another tables with same key', async () => {
      const cryptoKey = 'same raw key';
      const key = 'any key';
      let subject = registerSubject(new CryptoStorage(cryptoKey, 'first db'));
      await subject.save(key, 'any value');
      subject = registerSubject(new CryptoStorage(cryptoKey, 'second db'));
      expect(await subject.load(key)).toBeUndefined();
    });

    it('should not get values from another salt with same key, db name and store name', async () => {
      const cryptoKey = 'same raw key';
      const dbName = 'same db name';
      const storeName = 'same store name';
      let subject = registerSubject(
        new CryptoStorage(cryptoKey, dbName, storeName, new Uint8Array([1, 1, 1])),
      );
      const key = 'any key';
      const originalValue = 'any value';
      await subject.save(key, originalValue);
      subject = registerSubject(
        new CryptoStorage(cryptoKey, dbName, storeName, new Uint8Array([2, 2, 2])),
      );
      expect(await getErrorMessage(subject.load(key))).toBe(CryptoStorage.AuthenticityError);
    });

    it('should not get values from another interaction with same key, db name, store name and salt', async () => {
      const cryptoKey = 'same raw key';
      const dbName = 'same db name';
      const storeName = 'same store name';
      const salt = new Uint8Array([1, 3, 9]);
      let subject = registerSubject(new CryptoStorage(cryptoKey, dbName, storeName, salt, 11111));
      const key = 'any key';
      const originalValue = 'any value';
      await subject.save(key, originalValue);
      subject = registerSubject(new CryptoStorage(cryptoKey, dbName, storeName, salt, 22222));
      expect(await getErrorMessage(subject.load(key))).toBe(CryptoStorage.AuthenticityError);
    });
  });

  describe('when cleaning data', () => {
    it('should clear all existing data', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      await subject.save('any key', 'any data');
      await subject.clear();
      expect(await indexDbSearch(subject, { anyData: true })).toBeFalse();
    });

    it('should not delete the store', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      await subject.save('any key', 'any data');
      await subject.clear();
      expect(await indexDbSearch(subject, { anyStore: true })).toBeTrue();
    });

    it('should not delete the data base', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      await subject.save('any key', 'any data');
      await subject.clear();
      expect(await indexDbSearch(subject, { anyDb: true })).toBeTrue();
    });
  });

  describe('when deleting the database', () => {
    it('should delete the data base', async () => {
      const subject = new CryptoStorage('raw key');
      await subject.save('any key', 'any data');
      await subject.delete();
      expect(await indexDbSearch(subject, { anyDb: true })).toBeFalsy();
    });
  });

  describe('when closing the database', () => {
    it('should have close the database with saved data', async () => {
      let subject = new CryptoStorage('raw key');
      await subject.save('any key', 'any data');
      await subject.close();
      subject = registerSubject(new CryptoStorage('raw key'));
      expect(await indexDbSearch(subject, { anyData: true })).toBeTrue();
    });
  });
});
