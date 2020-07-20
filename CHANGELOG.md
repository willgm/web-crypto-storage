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
