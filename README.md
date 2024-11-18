# NodeJS Driver for CrossDB

## Pre-requirement
You need to [install](https://crossdb.org/get-started/install/) crossdb lib first

> ### Not ready for production

## Install
```sh
  npm install @croosdb/crossdb-nodejs
```
### to Use

```javascript
  const CrossDB = require('@croosdb/crossdb-nodejs');

  const db = new CrossDB(':memory:');
// or
  const db = new CrossDB('./<<path>>/<<db name>>');
```


## Run Example

```sh
  npm install
  npm start
```
