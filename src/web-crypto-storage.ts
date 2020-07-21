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
import { deleteDB, IDBPDatabase, openDB } from 'idb';

/**
 * Default input data formats to be encrypted and stored.
 */
export type InputData = string | TypedArray;

/**
 * Configuration used to initialize the Crypto Storage.
 */
export interface CryptoStorageConfig {
  /**
   * Base key used to encrypt the stored data.
   */
  baseKey: InputData | CryptoKey;
  /**
   * Database name used to store the data.
   */
  dbName?: string;
  /**
   * Storage name used to store the data.
   */
  storeName?: string;
  /**
   * Custom salt used to encrypt the stored data.
   */
  salt?: TypedArray;
  /**
   * Custom iteration cycles to encrypt the stored data.
   */
  encryptIterations?: number;
}

/**
 * @internal
 */
type InternalConfig = [IDBPDatabase<any>, string, CryptoKey, TypedArray, number | undefined];

/**
 * Crypto Storage service used to save and load local encrypted data using IndexedDB.
 */
export class CryptoStorage {
  /**
   * Default authenticity error message when the `CryptoStorage` were not able de decrypt the stored data.
   */
  static AuthenticityError = 'Integrity/Authenticity check failed!';

  /**
   * Default error message when a crypto key were not given.
   */
  static CryptoKeyError = 'CryptoStorage needs a base key to work properly';

  /**
   * @internal
   */
  private internalConfig: Promise<InternalConfig>;

  /**
   * Base constructor that receive all the configuration as an object.
   */
  constructor(config: CryptoStorageConfig);
  /**
   * Base constructor.
   * @param baseKey Base key used to encrypt the stored data.
   * @param dbName Database name used to store the data.
   * @param storeName Storage name used to store the data.
   * @param salt Custom salt used to encrypt the stored data.
   * @param encryptIterations Custom iteration cycles to encrypt the stored data.
   */
  constructor(
    baseKey: InputData | CryptoKey,
    dbName?: string,
    storeName?: string,
    salt?: TypedArray,
    encryptIterations?: number,
  );
  constructor(
    baseKeyOrConfig: InputData | CryptoKey | CryptoStorageConfig,
    dbName?: string,
    storeName?: string,
    salt?: TypedArray,
    encryptIterations?: number,
  ) {
    this.internalConfig = init(
      baseKeyOrConfig?.hasOwnProperty('baseKey')
        ? (baseKeyOrConfig as CryptoStorageConfig)
        : ({
            baseKey: baseKeyOrConfig,
            dbName,
            storeName,
            salt,
            encryptIterations,
          } as CryptoStorageConfig),
    );
  }

  /**
   * Loads and decrypt the stored data that match the given key.
   *
   * @param key The given key to find the data.
   * @returns Promise with the decrypted data that match the given key, or undefined if nothing was found.
   */
  async get(key: InputData): Promise<string | undefined> {
    const [[store, storeName, baseKey, salt, encryptIterations], hashKey, hashNonce] = await all([
      this.internalConfig,
      generateHash(key),
      generateHash(key + '-nonce'),
    ]);

    const cryptoValue = await store.get(storeName, hashKey);
    if (!cryptoValue) return;

    const [cryptoKey, nonce] = await all([
      deriveCryptKey(baseKey, salt, encryptIterations),
      store.get(storeName, hashNonce),
    ]);

    try {
      const value = await decryptValue(cryptoValue, cryptoKey, nonce);
      return decode(value);
    } catch (error) {
      throw new Error(CryptoStorage.AuthenticityError);
    }
  }

  /**
   * Encrypt and save the given data and key.
   *
   * @param key The key to be encrypted and find the data in the future.
   * @param value The value to be encrypted and stored.
   * @returns Promise to know when the encrypt and store process was complete.
   */
  async set(key: InputData, value: InputData): Promise<void> {
    const [[store, storeName, baseKey, salt, encryptIterations], hashKey, hashNonce] = await all([
      this.internalConfig,
      generateHash(key),
      generateHash(key + '-nonce'),
    ]);

    const cryptoKey = await deriveCryptKey(baseKey, salt, encryptIterations);
    const [cryptoValue, nonce] = await encryptValue(value, cryptoKey);
    await all([store.put(storeName, cryptoValue, hashKey), store.put(storeName, nonce, hashNonce)]);
  }

  /**
   * Erase all key and data stored at the current store and database, but keeping the structure.
   *
   * @returns Promise to know when the process was complete.
   */
  async clear(): Promise<void> {
    const [store, storeName, _, salt] = await this.internalConfig;
    await store.clear(storeName);
    await verifySalt(store, storeName, salt);
  }

  /**
   * Completely close the database connection.
   *
   * @returns Promise to know when the process was complete.
   */
  async close(): Promise<void> {
    const [store] = await this.internalConfig;
    store.close();
  }

  /**
   * Delete individual data that match the given key.
   *
   * @param key The given key to find the data.
   * @returns Promise to know when the process was complete.
   */
  async delete(key: InputData): Promise<void> {
    const [[store, storeName], hashKey, hashNonce] = await all([
      this.internalConfig,
      generateHash(key),
      generateHash(key + '-nonce'),
    ]);
    await all([store.delete(storeName, hashKey), store.delete(storeName, hashNonce)]);
  }

  /**
   * Fully delete not only all the key and data stored at the current store and database,
   * but also deleting the whole store and database the structure.
   *
   * @returns Promise to know when the process was complete.
   */
  async deleteDB(): Promise<void> {
    const [store] = await this.internalConfig;
    store.close();
    await deleteDB(store.name);
  }
}

/**
 * @internal
 */
const all = Promise.all.bind(Promise);

/**
 * @internal
 */
const init = async ({
  baseKey,
  dbName = 'default-key-value-db',
  storeName = 'default-key-value-storage',
  salt,
  encryptIterations,
}: CryptoStorageConfig): Promise<InternalConfig> => {
  if (!baseKey) throw new Error(CryptoStorage.CryptoKeyError);
  const [dbHashName, storeHashName, cryptoBaseKey] = await all([
    generateHash(dbName),
    generateHash(storeName),
    baseKey instanceof CryptoKey ? baseKey : generateBaseCryptoKey(baseKey),
  ]);
  const decodedStorageName = decode(storeHashName);
  const store = openDB(decode(dbHashName), 1, {
    upgrade(db) {
      db.createObjectStore(decodedStorageName);
    },
  });
  return all([
    store,
    decodedStorageName,
    cryptoBaseKey,
    verifySalt(store, decodedStorageName, salt),
    encryptIterations,
  ]);
};

/**
 * @internal
 */
const verifySalt = async (
  storePromise: IDBPDatabase | Promise<IDBPDatabase>,
  storeName: string,
  salt?: TypedArray,
): Promise<TypedArray> => {
  const [hash, store] = await all([generateHash('salt'), storePromise]);
  const existingSalt = await store.get(storeName, hash);
  if (existingSalt && (!salt || existingSalt === salt)) {
    return existingSalt;
  }
  return persistSalt(hash, store, storeName, salt);
};

/**
 * @internal
 */
const persistSalt = async (
  saltHash: TypedArray,
  store: IDBPDatabase,
  storeName: string,
  currentSalt?: TypedArray,
): Promise<TypedArray> => {
  const salt = currentSalt ?? generateSalt();
  await store.put(storeName, salt, saltHash);
  return salt;
};
