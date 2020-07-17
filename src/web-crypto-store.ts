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
 * Configuration used to initialize the Crypto Store.
 */
export interface CryptoStoreConfig {
  /**
   * Base key used to encrypt the stored data.
   */
  baseKey: InputData | CryptoKey;
  /**
   * Database name used to store the data.
   */
  dbName?: string;
  /**
   * Store name used to store the data.
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
 * Crypto Store service used to save and load local encrypted data using IndexDB.
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
  constructor(config: CryptoStoreConfig);
  /**
   * Base constructor.
   * @param baseKey Base key used to encrypt the stored data.
   * @param dbName Database name used to store the data.
   * @param storeName Store name used to store the data.
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
    baseKeyOrConfig: InputData | CryptoKey | CryptoStoreConfig,
    dbName?: string,
    storeName?: string,
    salt?: TypedArray,
    encryptIterations?: number,
  ) {
    this.internalConfig = init(
      baseKeyOrConfig?.hasOwnProperty('baseKey')
        ? (baseKeyOrConfig as CryptoStoreConfig)
        : ({
            baseKey: baseKeyOrConfig,
            dbName,
            storeName,
            salt,
            encryptIterations,
          } as CryptoStoreConfig),
    );
  }

  /**
   * Loads and decrypt the stored data that match the given key.
   *
   * @param key The given key to find the data.
   * @returns Promise with the decrypted data that match the given key, or undefined if nothing was found.
   */
  async load(key: InputData): Promise<string | undefined> {
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
  async save(key: InputData, value: InputData): Promise<void> {
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
    const [store, storeName] = await this.internalConfig;
    await store.clear(storeName);
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
   * Fully delete not only all the key and data stored at the current store and database,
   * but also deleting the whole store and database the structure.
   *
   * @returns Promise to know when the process was complete.
   */
  async delete(): Promise<void> {
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
  storeName = 'default-key-value-store',
  salt,
  encryptIterations,
}: CryptoStoreConfig): Promise<InternalConfig> => {
  if (!baseKey) throw new Error(CryptoStorage.CryptoKeyError);
  return all([
    generateHash(dbName),
    generateHash(storeName),
    baseKey instanceof CryptoKey ? baseKey : generateBaseCryptoKey(baseKey),
  ]).then(([dbHashName, storeHashName, cryptoBaseKey]) => {
    const decodedStoreName = decode(storeHashName);
    const store = openDB(decode(dbHashName), 1, {
      upgrade(db) {
        db.createObjectStore(decodedStoreName);
      },
    });
    return all([
      store,
      decodedStoreName,
      cryptoBaseKey,
      salt ?? getSalt(store, decodedStoreName),
      encryptIterations,
    ]);
  });
};

/**
 * @internal
 */
const getSalt = async (
  storePromise: Promise<IDBPDatabase>,
  storeName: string,
): Promise<TypedArray> => {
  const [hash, store] = await all([generateHash('salt'), storePromise]);
  const salt = await store.get(storeName, hash);
  return salt || createSalt(hash, store, storeName);
};

/**
 * @internal
 */
const createSalt = async (
  saltHash: TypedArray,
  store: IDBPDatabase,
  storeName: string,
): Promise<TypedArray> => {
  const newSalt = generateSalt();
  await store.put(storeName, newSalt, saltHash);
  return newSalt;
};
