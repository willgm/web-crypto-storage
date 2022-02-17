# [3.0.0](https://github.com/willgm/web-crypto-storage/compare/v2.0.3...v3.0.0) (2022-02-17)


### Features

* support for TypeScript 4.5 ([049a6d9](https://github.com/willgm/web-crypto-storage/commit/049a6d9bf76931c6b259cde656ce1b65e3209c44))
* supporting idb v6 ([5ae5b23](https://github.com/willgm/web-crypto-storage/commit/5ae5b238a4968e3a7fc7ff28a2c2c65de5f8cb1c))


### BREAKING CHANGES

* Some type definitions on the public API needed to be changed due to TypeScript

## [2.0.3](https://github.com/willgm/web-crypto-storage/compare/v2.0.2...v2.0.3) (2022-02-16)


### Bug Fixes

* updating all non breaking dependencies ([c4bda2b](https://github.com/willgm/web-crypto-storage/commit/c4bda2bf5bdae9b355a4568381c577b63a66dca9))

## [2.0.2](https://github.com/willgm/web-crypto-storage/compare/v2.0.1...v2.0.2) (2020-10-26)


### Bug Fixes

* **deps:** updating main dependencies ([e4e527f](https://github.com/willgm/web-crypto-storage/commit/e4e527fe6137ea3809b4c6529aa958ee1b8bce7b))

## [2.0.1](https://github.com/willgm/web-crypto-storage/compare/v2.0.0...v2.0.1) (2020-09-16)


### Bug Fixes

* **update:** bump dependencies ([9489e25](https://github.com/willgm/web-crypto-storage/commit/9489e258dbd89000fbed9a329c9bccb24dfcaf0a))

# [2.0.0](https://github.com/willgm/web-crypto-storage/compare/v1.0.0...v2.0.0) (2020-07-20)


### Bug Fixes

* **crypto-service:** persist the salt again after cleaning all data ([89f9728](https://github.com/willgm/web-crypto-storage/commit/89f972853e74b980266dac2353d831adc2ce3d5a))
* **naming:** better name to describe the intent of the project ([55d58f8](https://github.com/willgm/web-crypto-storage/commit/55d58f82eeb881c7b059e18cc619d43e27668df1))
* **storage-service:** use a standard interface to set and get data ([dfd54bc](https://github.com/willgm/web-crypto-storage/commit/dfd54bc32bed91edeee56af229c96b314c7c3c7f))


### Features

* **delete:** method to delete individual data by their key ([74efe28](https://github.com/willgm/web-crypto-storage/commit/74efe28f3cb91e9e8f0fb48e2c40e1b48686fc3e))


### BREAKING CHANGES

* **storage-service:** load -> get, save -> set, delete -> deleteDB
* **naming:** @webcrypto/store -> @webcrypto/storage, CryptoStore -> CryptoStorage

# 1.0.0 (2020-07-17)

### Features

- **crypto-storage:** first stable version ([9e9417e](https://github.com/willgm/web-crypto-storage/commit/9e9417eeeeda5eb2f32162e7d65ea9d7c32efb69))
