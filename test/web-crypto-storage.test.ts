import { generateBaseCryptoKey } from '@webcrypto/tools';

import { CryptoStorage } from '../src/web-crypto-storage';
import { getErrorMessage, indexedDBSearch, setupSubjectList } from './tools';

declare global {
  interface IDBFactory {
    databases: () => Promise<{ name: string; version: number }[]>;
  }
}

const { registerSubject, clearSubjects } = setupSubjectList();

describe('Web Crypto IndexedDB', () => {
  afterEach(async () => {
    await clearSubjects();
  });

  describe('when saving data', () => {
    it('should not be able to save data without a crypto key', async () => {
      const init = async () => {
        const subject = new CryptoStorage(undefined as any);
        await subject.set('any key', 'any data');
      };
      expect(await getErrorMessage(init())).toBe(CryptoStorage.CryptoKeyError);
    });

    it('should not be able to save data without a crypto key when using a object config', async () => {
      const init = async () => {
        const subject = new CryptoStorage({ baseKey: undefined as any });
        await subject.set('any key', 'any data');
      };
      expect(await getErrorMessage(init())).toBe(CryptoStorage.CryptoKeyError);
    });

    it('should be able to save data with a raw crypto key', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      await subject.set('any key', 'any value');
      const result = await indexedDBSearch(subject, { anyData: true });
      expect(result).toBeTrue();
    });

    it('should be able to save data with a crypto key', async () => {
      const cryptoKey = await generateBaseCryptoKey('raw key');
      const subject = registerSubject(new CryptoStorage(cryptoKey));
      await subject.set('any key', 'any value');
      const result = await indexedDBSearch(subject, { anyData: true });
      expect(result).toBeTrue();
    });

    it('should not save the raw key', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      const key = 'any key';
      await subject.set(key, 'any value');
      const result = await indexedDBSearch(subject, { key });
      expect(result).toBeFalse();
    });

    it('should not save the raw value', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      const value = 'any value';
      await subject.set('any key', value);
      const result = await indexedDBSearch(subject, { value });
      expect(result).toBeFalse();
    });

    it('should not use the raw data base name', async () => {
      const dbName = 'any db';
      const subject = registerSubject(new CryptoStorage('raw key', dbName));
      await subject.set('any key', 'any value');
      const result = await indexedDBSearch(subject, { dbName });
      expect(result).toBeFalse();
    });

    it('should not use the raw table name', async () => {
      const storeName = 'any db';
      const subject = registerSubject(new CryptoStorage('raw key', undefined, storeName));
      await subject.set('any key', 'any value');
      const result = await indexedDBSearch(subject, { storeName });
      expect(result).toBeFalse();
    });

    it('should not use the raw data base name with object constructor', async () => {
      const dbName = 'any db';
      const subject = registerSubject(new CryptoStorage({ baseKey: 'raw key', dbName }));
      await subject.set('any key', 'any value');
      const result = await indexedDBSearch(subject, { dbName });
      expect(result).toBeFalse();
    });

    it('should not use the raw table name with object constructor', async () => {
      const storeName = 'any db';
      const subject = registerSubject(new CryptoStorage({ baseKey: 'raw key', storeName }));
      await subject.set('any key', 'any value');
      const result = await indexedDBSearch(subject, { storeName });
      expect(result).toBeFalse();
    });
  });

  describe('when loading data', () => {
    it('should get the original value', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      const key = 'any key';
      const originalValue = 'any value';
      await subject.set(key, originalValue);
      expect(await subject.get(key)).toBe(originalValue);
    });

    it('should get the original value in another instance with same key', async () => {
      const cryptoKey = 'same raw key';
      const key = 'any key';
      const originalValue = 'any value';
      let subject = registerSubject(new CryptoStorage(cryptoKey));
      await subject.set(key, originalValue);
      subject = registerSubject(new CryptoStorage(cryptoKey));
      expect(await subject.get(key)).toBe(originalValue);
    });

    it('should get the original value in another instance with same key and db name', async () => {
      const cryptoKey = 'same raw key';
      const dbName = 'same db name';
      const key = 'any key';
      const originalValue = 'any value';
      let subject = registerSubject(new CryptoStorage(cryptoKey, dbName));
      await subject.set(key, originalValue);
      subject = registerSubject(new CryptoStorage(cryptoKey, dbName));
      expect(await subject.get(key)).toBe(originalValue);
    });

    it('should get the original value in another instance with same key, db name and store name', async () => {
      const cryptoKey = 'same raw key';
      const dbName = 'same db name';
      const storeName = 'same store name';
      const key = 'any key';
      const originalValue = 'any value';
      let subject = registerSubject(new CryptoStorage(cryptoKey, dbName, storeName));
      await subject.set(key, originalValue);
      subject = registerSubject(new CryptoStorage(cryptoKey, dbName, storeName));
      expect(await subject.get(key)).toBe(originalValue);
    });

    it('should get the original value in another instance with same key, db name, store name and salt', async () => {
      const cryptoKey = 'same raw key';
      const dbName = 'same db name';
      const storeName = 'same store name';
      const salt = new Uint8Array([1, 3, 9]);
      const key = 'any key';
      const originalValue = 'any value';
      let subject = registerSubject(new CryptoStorage(cryptoKey, dbName, storeName, salt));
      await subject.set(key, originalValue);
      subject = registerSubject(new CryptoStorage(cryptoKey, dbName, storeName, salt));
      expect(await subject.get(key)).toBe(originalValue);
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
      await subject.set(key, originalValue);
      subject = registerSubject(
        new CryptoStorage(cryptoKey, dbName, storeName, salt, interactions),
      );
      expect(await subject.get(key)).toBe(originalValue);
    });

    it('should not be able to load data stored with a different key', async () => {
      let subject = registerSubject(new CryptoStorage('first key'));
      const key = 'any key';
      const originalValue = 'any value';
      await subject.set(key, originalValue);
      subject = registerSubject(new CryptoStorage('another key'));
      expect(await getErrorMessage(subject.get(key))).toBe(CryptoStorage.AuthenticityError);
    });

    it('should not get values from another tables with same key', async () => {
      const cryptoKey = 'same raw key';
      const key = 'any key';
      let subject = registerSubject(new CryptoStorage(cryptoKey, 'first db'));
      await subject.set(key, 'any value');
      subject = registerSubject(new CryptoStorage(cryptoKey, 'second db'));
      expect(await subject.get(key)).toBeUndefined();
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
      await subject.set(key, originalValue);
      subject = registerSubject(
        new CryptoStorage(cryptoKey, dbName, storeName, new Uint8Array([2, 2, 2])),
      );
      expect(await getErrorMessage(subject.get(key))).toBe(CryptoStorage.AuthenticityError);
    });

    it('should not get values from another interaction with same key, db name, store name and salt', async () => {
      const cryptoKey = 'same raw key';
      const dbName = 'same db name';
      const storeName = 'same store name';
      const salt = new Uint8Array([1, 3, 9]);
      let subject = registerSubject(new CryptoStorage(cryptoKey, dbName, storeName, salt, 11111));
      const key = 'any key';
      const originalValue = 'any value';
      await subject.set(key, originalValue);
      subject = registerSubject(new CryptoStorage(cryptoKey, dbName, storeName, salt, 22222));
      expect(await getErrorMessage(subject.get(key))).toBe(CryptoStorage.AuthenticityError);
    });
  });

  describe('when cleaning data', () => {
    it('should clear all existing data but the salt', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      await subject.set('any key 1', 'any data 1');
      await subject.set('any key 2', 'any data 2');
      await subject.clear();
      expect(await indexedDBSearch(subject, { justSalt: true })).toBeTrue();
    });

    it('should not delete the store', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      await subject.set('any key', 'any data');
      await subject.clear();
      expect(await indexedDBSearch(subject, { anyStorage: true })).toBeTrue();
    });

    it('should not delete the data base', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      await subject.set('any key', 'any data');
      await subject.clear();
      expect(await indexedDBSearch(subject, { anyDb: true })).toBeTrue();
    });

    it('should be able to set new values after cleaning and get it from another instance', async () => {
      const cryptoKey = 'raw key';
      const key = 'any key';
      const value = 'any value';
      let subject = registerSubject(new CryptoStorage(cryptoKey));
      await subject.set(key, value);
      await subject.clear();
      await subject.set(key, value);
      subject = registerSubject(new CryptoStorage(cryptoKey));
      expect(await subject.get(key)).toBe(value);
    });
  });

  describe('when deleting individual data', () => {
    it('should keep the salt even if it deletes the only existing data', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      const key = 'any key 1';
      await subject.set(key, 'any data 1');
      await subject.delete(key);
      expect(await indexedDBSearch(subject, { justSalt: true })).toBeTrue();
    });

    it('should delete data only for the giving key', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      const key = 'any key 1';
      await subject.set(key, 'any data 1');
      await subject.set('any key 2', 'any data 2');
      await subject.delete(key);
      expect(await indexedDBSearch(subject, { anyData: true })).toBeTrue();
    });

    it('should be able to set new data after deleting one', async () => {
      const subject = registerSubject(new CryptoStorage('raw key'));
      const key = 'any key 1';
      await subject.set(key, 'any data 1');
      await subject.delete(key);
      await subject.set('any key 2', 'any data 2');
      expect(await indexedDBSearch(subject, { anyData: true })).toBeTrue();
    });

    it('should not be able to get the deleted data from another instance', async () => {
      const cryptoKey = 'raw key';
      const key = 'any key';
      let subject = registerSubject(new CryptoStorage(cryptoKey));
      await subject.set(key, 'any data');
      await subject.delete(key);
      subject = registerSubject(new CryptoStorage(cryptoKey));
      expect(await subject.get(key)).toBeUndefined();
    });
  });

  describe('when deleting the database', () => {
    it('should delete the data base', async () => {
      const subject = new CryptoStorage('raw key');
      await subject.set('any key', 'any data');
      await subject.deleteDB();
      expect(await indexedDBSearch(subject, { anyDb: true })).toBeFalsy();
    });
  });

  describe('when closing the database', () => {
    it('should have close the database with saved data', async () => {
      let subject = new CryptoStorage('raw key');
      await subject.set('any key', 'any data');
      await subject.close();
      subject = registerSubject(new CryptoStorage('raw key'));
      expect(await indexedDBSearch(subject, { anyData: true })).toBeTrue();
    });
  });
});
