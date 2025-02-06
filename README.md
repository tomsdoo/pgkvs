# @tomsd/pgkvs

It's a key value store handler that the repository is a postgresql database, for easy-use.  
See [pgkvs.netlify.app](https://pgkvs.netlify.app/) for details.

![npm](https://img.shields.io/npm/v/@tomsd/pgkvs?style=for-the-badge&logo=npm)
![NPM](https://img.shields.io/npm/l/@tomsd/pgkvs?style=for-the-badge&logo=npm)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-222?style=for-the-badge&logo=postgresql)


![ci](https://img.shields.io/github/actions/workflow/status/tomsdoo/pgkvs/ci.yml?style=social&logo=github)
![checks](https://img.shields.io/github/check-runs/tomsdoo/pgkvs/main?style=social&logo=github)
![top language](https://img.shields.io/github/languages/top/tomsdoo/pgkvs?style=social&logo=typescript)


[![](https://nodei.co/npm/@tomsd/pgkvs.svg?mini=true)](https://www.npmjs.com/package/@tomsd/pgkvs)

## Installation
``` shell
npm install @tomsd/pgkvs
```

## Usage

``` typescript
import { PgKvs } from "@tomsd/pgkvs";

const uri = "postgres://...";
const tableName = "testTable";

(async () => {

  const store = new PgKvs(uri, tableName);

  const record = await store.upsert({ name: "alice" });
  console.log(record); // { _id: "xxx", name: "alice" }

  console.log(
    await store.getAll()
  ); // [{ _id: "xxx", name: "alice" }]

  console.log(
    await store.get(record._id)
  ); // { _id: "xxx", name: "alice" }

  console.log(
    await store.upsert({
      ...record,
      name: "bob",
      age: 25
    })
  ); // { _id: "xxx", name: "bob", age: 25 }

  console.log(
    await store.remove(record._id)
  ); // true

})();
```
