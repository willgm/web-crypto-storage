# Web Crypto Storage

<p>
  <a
    href="https://github.com/willgm/web-crypto-storage/actions"
    target="_blank"
  >
    <img
      alt="Build"
      src="https://img.shields.io/github/workflow/status/willgm/web-crypto-storage/CI"
    />
  </a>
  <a
    href="https://www.npmjs.com/package/@webcrypto/storage"
    target="_blank"
  >
    <img
      alt="Version"
      src="https://img.shields.io/github/package-json/v/willgm/web-crypto-storage"
    />
  </a>
  <a
    href="https://willgm.github.io/web-crypto-storage/demo/index.html"
    target="_blank"
  >
    <img
      alt="Demo"
      src="https://img.shields.io/badge/demo-online-green"
    />
  </a>
  <a
    href="https://github.com/willgm/web-crypto-storage/blob/master/LICENSE"
    target="_blank"
  >
    <img
      src="https://img.shields.io/badge/license-MIT-blue.svg"
      alt="web-crypto-storage is released under the MIT license"
    />
  </a>
  <a
    href="https://github.com/willgm/web-crypto-storage/graphs/contributors"
    target="_blank"
  >
    <img
      alt="Contributors"
      src="https://img.shields.io/github/contributors/willgm/web-crypto-storage.svg"
    />
  </a>
</p>

> A tiny promise-based crypto keyval storage using IndexedDB and the native Web Crypto API

This is a tiny promise-based crypto keyval storage using IndexedDB and the native [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), having just two small dependencies: [IDB](https://github.com/jakearchibald/idb) for a better devxp using IndexedDB and [Web Crypto Tools](https://github.com/willgm/web-crypto-tools) for a better devxp using the Web Crypto API.

This crypto storage not only encrypt/decrypt the data but also checks for integrity, verifying if the stored data were manually updated. It uses the default crypto algorithms on [Web Crypto Tools](https://github.com/willgm/web-crypto-tools), which are `PBKDF2` for hashing and key derivation and `AES-GCM` for encryption, with the option to customize the used salt and encrypt iterations. The base crypto key is safely used in memory and never stored locally, if at the next session the base crypto key is lost, the data cannot be decrypted back to the original value.

This project depends on the browser implementation of [Crypto API](https://caniuse.com/#feat=cryptography) and [TextEncoder API](https://caniuse.com/#feat=textencoder), which are both current implemented on all green browsers. If you do need to support any older browser, you should look for available polyfills.

## :house: Demo

You can play with a [full feature demo](https://willgm.github.io/web-crypto-storage/demo/index.html) on our Github Pages.

## :gear: Usage

### Install it at your project

```bash
npm install @webcrypto/storage --save
```

### Store your crypto data

```ts
// Create a new instance of the crypto storage and give it a key!
// Be aware that normally you would never hard code the key like in this example,
// take a look at the FAQ for more information on how to handle crypto keys.
const cryptoStore = new CryptoStorage('my crypto key');

// Secure store your data locally fully encrypted
const originalValue = 'any data value';
await cryptoStore.set('data key', originalValue);

// Look at the browser dev tools from IndexedDb,
// you will not be able to read the data key or value.
// Then, retrieve your original data decrypted again:
const decryptedValue = await cryptoStore.get('data key');
expect(decryptedValue).toEqual(originalValue);
```

## :book: Documentation

You should check our GitHub Pages for [all available APIs and options](https://willgm.github.io/web-crypto-storage/).

There is a [full feature example of use](https://github.com/willgm/web-crypto-storage/tree/master/demo) at the code base. The [test cases](https://github.com/willgm/web-crypto-storage/tree/master/test) are also quite readable and can be used as an example for every possible use of the public API.

This project is heavily inspired on [Tim Taubert](https://twitter.com/ttaubert)'s talk at JSConf EU: [Keeping secrets with JavaScript](https://www.youtube.com/watch?v=yf4m9LdO1zI), if you want to better understand what happens under the hood, then I highly recommend for you to watch it out.

### Crypto Key FAQ

#### What should I use as the crypto key?

There is no perfect answer to this question, it depends on your objective using this library and the application itself. If you do want to have strong security and make as difficult as possible to someone not authorized to access the data, then the crypto key should be unique per user, something strong that only the user knows and it is never stored anywhere out of his mind, as the **user password**. But it is not the only possible strategy, you can do any sort of server integration to obtain a crypto key, by session or any other thing that makes sense to your product logic or application platform.

#### Where should I store the crypto key?

If you really want to have your data protected, then the crypto key should never be stored in the browser, ideally should be something that you never store anywhere and just your user knows, like his password. But for some apps it doesn't make sense to use the user password or other user input as crypto key, then would be better to use some server integration to store and obtain the key when needed.

#### What about hard coded key at the app bundle?

The only scenario that it can make sense is if you just don't want to make obvious what you are storing on the browser, but you are not really worried if an advanced user go all the way through to decrypt the data. Please consider a better strategy that makes sense to your application.

#### How does this library handles and stores the crypto key?

This library doesn't store the crypto key anywhere, not even in memory, 'cause the first thing that this library does when it receives the given key is to derivate it to a new one, which will be actually used to encrypt/decrypt and kept in memory for this session. The new derived crypto key cannot be reverted to the original value, and is only kept in memory, so the original key will be necessary again at the next session, so that the stored encrypted data can be decrypted again.

## License

[MIT](https://github.com/willgm/web-crypto-storage/blob/master/LICENSE)
