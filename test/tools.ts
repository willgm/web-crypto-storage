import { CryptoStorage } from '../src/web-crypto-storage';
import { generateHash, decode } from '@webcrypto/tools';

export const all = Promise.all.bind(Promise);

export function setupSubjectList() {
  const subjectList = new Set<CryptoStorage>();

  return {
    registerSubject(subject: CryptoStorage) {
      subjectList.add(subject);
      return subject;
    },
    clearSubjects() {
      return all(Array.from(subjectList).map(db => db.deleteDB().catch())).finally(() =>
        subjectList.clear(),
      );
    },
  };
}

export type SimpleObj = {
  anyData?: boolean;
  anyStorage?: boolean;
  anyDb?: boolean;
  justSalt?: boolean;
  dbName?: string;
  tbName?: string;
  storeName?: string;
  key?: string;
  value?: string;
};

export const indexedDBSearch = async (
  store: CryptoStorage,
  { dbName, tbName, key, value, anyData, anyDb, anyStorage, justSalt }: SimpleObj,
): Promise<boolean> => {
  if (anyDb) {
    const allDbs = await indexedDB.databases();
    return allDbs.length !== 0;
  }

  if (dbName) {
    const allDbs = await indexedDB.databases();

    const found = allDbs.some(({ name }) => name === dbName);
    if (found) {
      return true;
    }
  }

  // tslint:disable-next-line:no-string-literal
  const [db, dbStorageName] = await store['internalConfig'];

  if (anyStorage) {
    return db.objectStoreNames.length !== 0;
  }

  const allKeys = await db.getAllKeys(dbStorageName);

  if (anyData) {
    // must have more than the salt
    return allKeys.length > 1;
  }

  if (justSalt) {
    if (allKeys.length !== 1) return false;

    const saltHash = await generateHash('salt');
    return decode(allKeys[0]) === decode(saltHash);
  }

  if (key && allKeys.some(k => k === key)) {
    return true;
  }

  if (tbName && tbName === dbStorageName) {
    return true;
  }

  if (value) {
    const values = await all(allKeys.map(k => db.get(dbStorageName, k)));
    const found = values.some(v => v === value);
    if (found) return true;
  }

  return false;
};

export async function getErrorMessage(promise: Promise<any>): Promise<string | undefined> {
  try {
    await promise;
  } catch (error) {
    return error.message;
  }
}
