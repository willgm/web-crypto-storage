(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const { CryptoStorage } = require('../dist/web-crypto-storage.cjs');

let cryptoStorage;

const INITIAL_NOTES = `You can insert any text you want here.
Save it to storage and reload the page.`;

function value(id, val) {
  let input = document.getElementById(id);
  if (val !== undefined) {
    input.value = val;
  } else {
    return input.value;
  }
}

function focus(id) {
  document.getElementById(id).focus();
}

function setclass(id, val) {
  let el = document.getElementById(id);
  el.className = val;
}

function updateStatus(val) {
  document.getElementById('status').innerHTML = '<b>Status:</b> ' + val;
}

const Buttons = {
  login() {
    const user = value('user');
    const pass = value('pass');
    if (!user || !pass) {
      return updateStatus('User and password are required');
    }
    // Here the user password is used as base crypto key
    // and the user name is used as database name to fully scope the data:
    cryptoStorage = new CryptoStorage(pass, user);
    cryptoStorage.get('mynotes').then(notes => {
      if (notes) {
        value('text', notes);
        updateStatus('Notes loaded for ' + user);
      } else {
        Buttons.paste();
        updateStatus('Example notes pasted. No saved notes found for ' + user);
      }
      setclass('login', 'hide');
      setclass('notes', 'show');
    }, updateStatus);
  },

  load() {
    cryptoStorage.get('mynotes').then(notes => {
      if (notes) {
        value('text', notes);
        updateStatus('Notes loaded.');
      } else {
        updateStatus('No saved notes found!');
      }
    }, updateStatus);
  },

  save() {
    const notes = value('text');
    cryptoStorage.set('mynotes', notes).then(() => {
      updateStatus('Notes saved.');
    });
  },

  paste() {
    value('text', INITIAL_NOTES);
    updateStatus('Example notes pasted.');
  },

  clear() {
    cryptoStorage.clear();
    Buttons.paste();
    updateStatus('Example notes pasted. (Storage cleared.)');
  },

  logout() {
    value('user', '');
    value('pass', '');
    // cryptoStorage.close();
    setclass('login', 'show');
    setclass('notes', 'hide');
    updateStatus('Logged out...');
    focus('user');
  },
};

addEventListener('click', event => {
  event.preventDefault();
  switch (event.target.id) {
    case 'login':
      Buttons.login();
      break;
    case 'load':
      Buttons.load();
      break;
    case 'save':
      Buttons.save();
      break;
    case 'paste':
      Buttons.paste();
      break;
    case 'clear':
      Buttons.clear();
      break;
    case 'logout':
      Buttons.logout();
      break;
  }
});

addEventListener('submit', event => {
  event.preventDefault();
  switch (event.target.id) {
    case 'login':
      Buttons.login();
      break;
  }
});

},{"../dist/web-crypto-storage.cjs":2}],2:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.webCryptoStorage = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    /**
     * Default number of iterations used with PBKDF2 algorithm
     */
    var PBKDF2_ITERATIONS_DEFAULT = 50000;
    /**
     * Creates a base Crypto Key from the original raw key, by default this base key
     * should just be used to protect the original key to be discovery,
     * and should not be used directly to any encrypt / decrypt algorithm.
     * The generated base crypto key should be used just to derive new ones,
     * that then will be used to encrypt / decrypt algorithms.
     *
     * @param rawKey The original key to start the encrypt process.
     * @param algorithm The algorithm used to import the key.
     * @param keyUsages The uses for the generated Crypto Key.
     * @param format Input format for the raw key.
     * @returns A promise with the base Crypto Key.
     */
    function generateBaseCryptoKey(rawKey, algorithm, keyUsages, format) {
        if (algorithm === void 0) { algorithm = 'PBKDF2'; }
        if (keyUsages === void 0) { keyUsages = ['deriveKey']; }
        if (format === void 0) { format = 'raw'; }
        var isJwkKey = !isTypedArray(rawKey) && typeof rawKey === 'object';
        return Promise.resolve(crypto.subtle.importKey(isJwkKey ? 'jwk' : format, typeof rawKey === 'string' ? encode(rawKey) : rawKey, algorithm, false, // the original value will not be extractable
        keyUsages));
    }
    function deriveCryptKey(cryptoBaseKey, deriveAlgorithmOrSalt, algorithmForOrIterations, keyUsages) {
        if (algorithmForOrIterations === void 0) { algorithmForOrIterations = PBKDF2_ITERATIONS_DEFAULT; }
        if (keyUsages === void 0) { keyUsages = ['encrypt', 'decrypt']; }
        var deriveAlgorithm = isTypedArray(deriveAlgorithmOrSalt)
            ? {
                name: 'PBKDF2',
                hash: 'SHA-256',
                salt: deriveAlgorithmOrSalt,
                iterations: typeof algorithmForOrIterations === 'number'
                    ? algorithmForOrIterations
                    : PBKDF2_ITERATIONS_DEFAULT,
            }
            : deriveAlgorithmOrSalt;
        // The derived key will be used to encrypt with AES by default.
        var algorithmFor = typeof algorithmForOrIterations === 'number'
            ? { name: 'AES-GCM', length: 256 }
            : algorithmForOrIterations;
        return Promise.resolve(crypto.subtle.deriveKey(deriveAlgorithm, cryptoBaseKey, algorithmFor, false, // the original key will not be extractable
        keyUsages));
    }
    /**
     * Type Guard to Typed Array.
     *
     * @param data Any data to be checked.
     * @returns Verify if the given data is a Typed Array.
     */
    function isTypedArray(data) {
        return ArrayBuffer.isView(data) || data instanceof ArrayBuffer;
    }
    /**
     * Encrypt a value with the given Crypto Key and Algorithm
     *
     * @param data Value to be encrypted.
     * @param cryptoKey The Crypto Key to be used in encryption.
     * @param algorithm The algorithm to be used in encryption. Default to `AES-GCM`.
     * @returns A promise with the encrypted value and the used nonce, if used with the encryption algorithm.
     */
    function encryptValue(data, cryptoKey, algorithm) {
        if (algorithm === void 0) { algorithm = { name: 'AES-GCM', iv: generateNonce() }; }
        return Promise.resolve(crypto.subtle.encrypt(algorithm, cryptoKey, encode(data))).then(function (cryptoValue) { return [cryptoValue, algorithm.iv || null]; });
    }
    /**
     * Decrypt a value with the given Crypto Key and Algorithm
     *
     * @param data Value to be encrypted.
     * @param cryptoKey The Crypto Key used in encryption.
     * @param nonceOrAlgorithm The nonce used for AES encryption or the custom algorithm.
     * @returns A promise with the decrypt value
     */
    function decryptValue(data, cryptoKey, nonceOrAlgorithm) {
        var algorithm = isTypedArray(nonceOrAlgorithm)
            ? { name: 'AES-GCM', iv: nonceOrAlgorithm }
            : nonceOrAlgorithm;
        return Promise.resolve(crypto.subtle.decrypt(algorithm, cryptoKey, data));
    }
    /**
     * Generates random value to be used as nonce with encryption algorithms.
     *
     * @param byteSize The byte size of the generated random value.
     * @returns The random value.
     */
    function generateNonce(byteSize) {
        if (byteSize === void 0) { byteSize = 16; }
        // We should generate at least 16 bytes
        // to allow for 2^128 possible variations.
        return generateRandomValues(byteSize);
    }
    /**
     * Generates random value to be used as salt with encryption algorithms.
     *
     * @param byteSize The byte size of the generated random value.
     * @returns The random value.
     */
    function generateSalt(byteSize) {
        if (byteSize === void 0) { byteSize = 8; }
        // We should generate at least 8 bytes
        // to allow for 2^64 possible variations.
        return generateRandomValues(byteSize);
    }
    /**
     * Generates random value as a typed array of `Uint8Array`.
     *
     * @param byteSize The byte size of the generated random value.
     * @returns The random value.
     */
    function generateRandomValues(byteSize) {
        if (byteSize === void 0) { byteSize = 8; }
        return crypto.getRandomValues(new Uint8Array(byteSize));
    }
    /**
     * Encode a string value to a Typed Array as `Uint8Array`.
     * If the given value is already a Typed Array, then the value will be returned without any transformation.
     *
     * @param data Value to be encoded.
     * @returns The transformed given value as a Typed Array.
     */
    function encode(data) {
        return isTypedArray(data) ? data : new TextEncoder().encode(data);
    }
    /**
     * Decode a ArrayBuffer value to a string.
     * If the given value is already a string, then the value will be returned without any transformation.
     *
     * @param data Value to be decoded.
     * @returns The transformed given value as a string.
     */
    function decode(data) {
        return typeof data === 'string' ? data : new TextDecoder('utf-8').decode(data);
    }
    /**
     * Generates a hash value for the given value.
     *
     * @param data Seed value to generate a hash.
     * @param algorithm The algorithm to be used when generating the hash.
     * @returns A promise containing the hash value.
     */
    function generateHash(data, algorithm) {
        if (algorithm === void 0) { algorithm = 'SHA-256'; }
        return Promise.resolve(crypto.subtle.digest(algorithm, encode(data)));
    }

    const instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);

    let idbProxyableTypes;
    let cursorAdvanceMethods;
    // This is a function to prevent it throwing up in node environments.
    function getIdbProxyableTypes() {
        return (idbProxyableTypes ||
            (idbProxyableTypes = [
                IDBDatabase,
                IDBObjectStore,
                IDBIndex,
                IDBCursor,
                IDBTransaction,
            ]));
    }
    // This is a function to prevent it throwing up in node environments.
    function getCursorAdvanceMethods() {
        return (cursorAdvanceMethods ||
            (cursorAdvanceMethods = [
                IDBCursor.prototype.advance,
                IDBCursor.prototype.continue,
                IDBCursor.prototype.continuePrimaryKey,
            ]));
    }
    const cursorRequestMap = new WeakMap();
    const transactionDoneMap = new WeakMap();
    const transactionStoreNamesMap = new WeakMap();
    const transformCache = new WeakMap();
    const reverseTransformCache = new WeakMap();
    function promisifyRequest(request) {
        const promise = new Promise((resolve, reject) => {
            const unlisten = () => {
                request.removeEventListener('success', success);
                request.removeEventListener('error', error);
            };
            const success = () => {
                resolve(wrap(request.result));
                unlisten();
            };
            const error = () => {
                reject(request.error);
                unlisten();
            };
            request.addEventListener('success', success);
            request.addEventListener('error', error);
        });
        promise
            .then((value) => {
            // Since cursoring reuses the IDBRequest (*sigh*), we cache it for later retrieval
            // (see wrapFunction).
            if (value instanceof IDBCursor) {
                cursorRequestMap.set(value, request);
            }
            // Catching to avoid "Uncaught Promise exceptions"
        })
            .catch(() => { });
        // This mapping exists in reverseTransformCache but doesn't doesn't exist in transformCache. This
        // is because we create many promises from a single IDBRequest.
        reverseTransformCache.set(promise, request);
        return promise;
    }
    function cacheDonePromiseForTransaction(tx) {
        // Early bail if we've already created a done promise for this transaction.
        if (transactionDoneMap.has(tx))
            return;
        const done = new Promise((resolve, reject) => {
            const unlisten = () => {
                tx.removeEventListener('complete', complete);
                tx.removeEventListener('error', error);
                tx.removeEventListener('abort', error);
            };
            const complete = () => {
                resolve();
                unlisten();
            };
            const error = () => {
                reject(tx.error || new DOMException('AbortError', 'AbortError'));
                unlisten();
            };
            tx.addEventListener('complete', complete);
            tx.addEventListener('error', error);
            tx.addEventListener('abort', error);
        });
        // Cache it for later retrieval.
        transactionDoneMap.set(tx, done);
    }
    let idbProxyTraps = {
        get(target, prop, receiver) {
            if (target instanceof IDBTransaction) {
                // Special handling for transaction.done.
                if (prop === 'done')
                    return transactionDoneMap.get(target);
                // Polyfill for objectStoreNames because of Edge.
                if (prop === 'objectStoreNames') {
                    return target.objectStoreNames || transactionStoreNamesMap.get(target);
                }
                // Make tx.store return the only store in the transaction, or undefined if there are many.
                if (prop === 'store') {
                    return receiver.objectStoreNames[1]
                        ? undefined
                        : receiver.objectStore(receiver.objectStoreNames[0]);
                }
            }
            // Else transform whatever we get back.
            return wrap(target[prop]);
        },
        set(target, prop, value) {
            target[prop] = value;
            return true;
        },
        has(target, prop) {
            if (target instanceof IDBTransaction &&
                (prop === 'done' || prop === 'store')) {
                return true;
            }
            return prop in target;
        },
    };
    function replaceTraps(callback) {
        idbProxyTraps = callback(idbProxyTraps);
    }
    function wrapFunction(func) {
        // Due to expected object equality (which is enforced by the caching in `wrap`), we
        // only create one new func per func.
        // Edge doesn't support objectStoreNames (booo), so we polyfill it here.
        if (func === IDBDatabase.prototype.transaction &&
            !('objectStoreNames' in IDBTransaction.prototype)) {
            return function (storeNames, ...args) {
                const tx = func.call(unwrap(this), storeNames, ...args);
                transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
                return wrap(tx);
            };
        }
        // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
        // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
        // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
        // with real promises, so each advance methods returns a new promise for the cursor object, or
        // undefined if the end of the cursor has been reached.
        if (getCursorAdvanceMethods().includes(func)) {
            return function (...args) {
                // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
                // the original object.
                func.apply(unwrap(this), args);
                return wrap(cursorRequestMap.get(this));
            };
        }
        return function (...args) {
            // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
            // the original object.
            return wrap(func.apply(unwrap(this), args));
        };
    }
    function transformCachableValue(value) {
        if (typeof value === 'function')
            return wrapFunction(value);
        // This doesn't return, it just creates a 'done' promise for the transaction,
        // which is later returned for transaction.done (see idbObjectHandler).
        if (value instanceof IDBTransaction)
            cacheDonePromiseForTransaction(value);
        if (instanceOfAny(value, getIdbProxyableTypes()))
            return new Proxy(value, idbProxyTraps);
        // Return the same value back if we're not going to transform it.
        return value;
    }
    function wrap(value) {
        // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
        // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
        if (value instanceof IDBRequest)
            return promisifyRequest(value);
        // If we've already transformed this value before, reuse the transformed value.
        // This is faster, but it also provides object equality.
        if (transformCache.has(value))
            return transformCache.get(value);
        const newValue = transformCachableValue(value);
        // Not all types are transformed.
        // These may be primitive types, so they can't be WeakMap keys.
        if (newValue !== value) {
            transformCache.set(value, newValue);
            reverseTransformCache.set(newValue, value);
        }
        return newValue;
    }
    const unwrap = (value) => reverseTransformCache.get(value);

    /**
     * Open a database.
     *
     * @param name Name of the database.
     * @param version Schema version.
     * @param callbacks Additional callbacks.
     */
    function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
        const request = indexedDB.open(name, version);
        const openPromise = wrap(request);
        if (upgrade) {
            request.addEventListener('upgradeneeded', (event) => {
                upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction));
            });
        }
        if (blocked)
            request.addEventListener('blocked', () => blocked());
        openPromise
            .then((db) => {
            if (terminated)
                db.addEventListener('close', () => terminated());
            if (blocking)
                db.addEventListener('versionchange', () => blocking());
        })
            .catch(() => { });
        return openPromise;
    }
    /**
     * Delete a database.
     *
     * @param name Name of the database.
     */
    function deleteDB(name, { blocked } = {}) {
        const request = indexedDB.deleteDatabase(name);
        if (blocked)
            request.addEventListener('blocked', () => blocked());
        return wrap(request).then(() => undefined);
    }

    const readMethods = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
    const writeMethods = ['put', 'add', 'delete', 'clear'];
    const cachedMethods = new Map();
    function getMethod(target, prop) {
        if (!(target instanceof IDBDatabase &&
            !(prop in target) &&
            typeof prop === 'string')) {
            return;
        }
        if (cachedMethods.get(prop))
            return cachedMethods.get(prop);
        const targetFuncName = prop.replace(/FromIndex$/, '');
        const useIndex = prop !== targetFuncName;
        const isWrite = writeMethods.includes(targetFuncName);
        if (
        // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
        !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) ||
            !(isWrite || readMethods.includes(targetFuncName))) {
            return;
        }
        const method = async function (storeName, ...args) {
            // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
            const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
            let target = tx.store;
            if (useIndex)
                target = target.index(args.shift());
            const returnVal = await target[targetFuncName](...args);
            if (isWrite)
                await tx.done;
            return returnVal;
        };
        cachedMethods.set(prop, method);
        return method;
    }
    replaceTraps((oldTraps) => ({
        ...oldTraps,
        get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
        has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop),
    }));

    /**
     * Crypto Storage service used to save and load local encrypted data using IndexedDB.
     */
    var CryptoStorage = /** @class */ (function () {
        function CryptoStorage(baseKeyOrConfig, dbName, storeName, salt, encryptIterations) {
            this.internalConfig = init((baseKeyOrConfig === null || baseKeyOrConfig === void 0 ? void 0 : baseKeyOrConfig.hasOwnProperty('baseKey')) ? baseKeyOrConfig
                : {
                    baseKey: baseKeyOrConfig,
                    dbName: dbName,
                    storeName: storeName,
                    salt: salt,
                    encryptIterations: encryptIterations,
                });
        }
        /**
         * Loads and decrypt the stored data that match the given key.
         *
         * @param key The given key to find the data.
         * @returns Promise with the decrypted data that match the given key, or undefined if nothing was found.
         */
        CryptoStorage.prototype.get = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, store, storeName, baseKey, salt, encryptIterations, hashKey, hashNonce, cryptoValue, _c, cryptoKey, nonce, value, error_1;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, all([
                                this.internalConfig,
                                generateHash(key),
                                generateHash(key + '-nonce'),
                            ])];
                        case 1:
                            _a = _d.sent(), _b = _a[0], store = _b[0], storeName = _b[1], baseKey = _b[2], salt = _b[3], encryptIterations = _b[4], hashKey = _a[1], hashNonce = _a[2];
                            return [4 /*yield*/, store.get(storeName, hashKey)];
                        case 2:
                            cryptoValue = _d.sent();
                            if (!cryptoValue)
                                return [2 /*return*/];
                            return [4 /*yield*/, all([
                                    deriveCryptKey(baseKey, salt, encryptIterations),
                                    store.get(storeName, hashNonce),
                                ])];
                        case 3:
                            _c = _d.sent(), cryptoKey = _c[0], nonce = _c[1];
                            _d.label = 4;
                        case 4:
                            _d.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, decryptValue(cryptoValue, cryptoKey, nonce)];
                        case 5:
                            value = _d.sent();
                            return [2 /*return*/, decode(value)];
                        case 6:
                            error_1 = _d.sent();
                            throw new Error(CryptoStorage.AuthenticityError);
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Encrypt and save the given data and key.
         *
         * @param key The key to be encrypted and find the data in the future.
         * @param value The value to be encrypted and stored.
         * @returns Promise to know when the encrypt and store process was complete.
         */
        CryptoStorage.prototype.set = function (key, value) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, store, storeName, baseKey, salt, encryptIterations, hashKey, hashNonce, cryptoKey, _c, cryptoValue, nonce;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, all([
                                this.internalConfig,
                                generateHash(key),
                                generateHash(key + '-nonce'),
                            ])];
                        case 1:
                            _a = _d.sent(), _b = _a[0], store = _b[0], storeName = _b[1], baseKey = _b[2], salt = _b[3], encryptIterations = _b[4], hashKey = _a[1], hashNonce = _a[2];
                            return [4 /*yield*/, deriveCryptKey(baseKey, salt, encryptIterations)];
                        case 2:
                            cryptoKey = _d.sent();
                            return [4 /*yield*/, encryptValue(value, cryptoKey)];
                        case 3:
                            _c = _d.sent(), cryptoValue = _c[0], nonce = _c[1];
                            return [4 /*yield*/, all([store.put(storeName, cryptoValue, hashKey), store.put(storeName, nonce, hashNonce)])];
                        case 4:
                            _d.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Erase all key and data stored at the current store and database, but keeping the structure.
         *
         * @returns Promise to know when the process was complete.
         */
        CryptoStorage.prototype.clear = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, store, storeName, _, salt;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.internalConfig];
                        case 1:
                            _a = _b.sent(), store = _a[0], storeName = _a[1], _ = _a[2], salt = _a[3];
                            return [4 /*yield*/, store.clear(storeName)];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, verifySalt(store, storeName, salt)];
                        case 3:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Completely close the database connection.
         *
         * @returns Promise to know when the process was complete.
         */
        CryptoStorage.prototype.close = function () {
            return __awaiter(this, void 0, void 0, function () {
                var store;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.internalConfig];
                        case 1:
                            store = (_a.sent())[0];
                            store.close();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Delete individual data that match the given key.
         *
         * @param key The given key to find the data.
         * @returns Promise to know when the process was complete.
         */
        CryptoStorage.prototype.delete = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, store, storeName, hashKey, hashNonce;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, all([
                                this.internalConfig,
                                generateHash(key),
                                generateHash(key + '-nonce'),
                            ])];
                        case 1:
                            _a = _c.sent(), _b = _a[0], store = _b[0], storeName = _b[1], hashKey = _a[1], hashNonce = _a[2];
                            return [4 /*yield*/, all([store.delete(storeName, hashKey), store.delete(storeName, hashNonce)])];
                        case 2:
                            _c.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Fully delete not only all the key and data stored at the current store and database,
         * but also deleting the whole store and database the structure.
         *
         * @returns Promise to know when the process was complete.
         */
        CryptoStorage.prototype.deleteDB = function () {
            return __awaiter(this, void 0, void 0, function () {
                var store;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.internalConfig];
                        case 1:
                            store = (_a.sent())[0];
                            store.close();
                            return [4 /*yield*/, deleteDB(store.name)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Default authenticity error message when the `CryptoStorage` were not able de decrypt the stored data.
         */
        CryptoStorage.AuthenticityError = 'Integrity/Authenticity check failed!';
        /**
         * Default error message when a crypto key were not given.
         */
        CryptoStorage.CryptoKeyError = 'CryptoStorage needs a base key to work properly';
        return CryptoStorage;
    }());
    /**
     * @internal
     */
    var all = Promise.all.bind(Promise);
    /**
     * @internal
     */
    var init = function (_a) {
        var baseKey = _a.baseKey, _b = _a.dbName, dbName = _b === void 0 ? 'default-key-value-db' : _b, _c = _a.storeName, storeName = _c === void 0 ? 'default-key-value-storage' : _c, salt = _a.salt, encryptIterations = _a.encryptIterations;
        return __awaiter(void 0, void 0, void 0, function () {
            var _d, dbHashName, storeHashName, cryptoBaseKey, decodedStorageName, store;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!baseKey)
                            throw new Error(CryptoStorage.CryptoKeyError);
                        return [4 /*yield*/, all([
                                generateHash(dbName),
                                generateHash(storeName),
                                baseKey instanceof CryptoKey ? baseKey : generateBaseCryptoKey(baseKey),
                            ])];
                    case 1:
                        _d = _e.sent(), dbHashName = _d[0], storeHashName = _d[1], cryptoBaseKey = _d[2];
                        decodedStorageName = decode(storeHashName);
                        store = openDB(decode(dbHashName), 1, {
                            upgrade: function (db) {
                                db.createObjectStore(decodedStorageName);
                            },
                        });
                        return [2 /*return*/, all([
                                store,
                                decodedStorageName,
                                cryptoBaseKey,
                                verifySalt(store, decodedStorageName, salt),
                                encryptIterations,
                            ])];
                }
            });
        });
    };
    /**
     * @internal
     */
    var verifySalt = function (storePromise, storeName, salt) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, hash, store, existingSalt;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, all([generateHash('salt'), storePromise])];
                case 1:
                    _a = _b.sent(), hash = _a[0], store = _a[1];
                    return [4 /*yield*/, store.get(storeName, hash)];
                case 2:
                    existingSalt = _b.sent();
                    if (existingSalt && (!salt || existingSalt === salt)) {
                        return [2 /*return*/, existingSalt];
                    }
                    return [2 /*return*/, persistSalt(hash, store, storeName, salt)];
            }
        });
    }); };
    /**
     * @internal
     */
    var persistSalt = function (saltHash, store, storeName, currentSalt) { return __awaiter(void 0, void 0, void 0, function () {
        var salt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    salt = currentSalt !== null && currentSalt !== void 0 ? currentSalt : generateSalt();
                    return [4 /*yield*/, store.put(storeName, salt, saltHash)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, salt];
            }
        });
    }); };

    exports.CryptoStorage = CryptoStorage;

    Object.defineProperty(exports, '__esModule', { value: true });

})));


},{}]},{},[1]);
