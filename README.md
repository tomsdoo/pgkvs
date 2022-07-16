# @tomsd/postgresqlclient

It's a handy postgresql client for easy-use, using postgresql database just like key value sture.

## Installation
``` shell
npm install @tomsd/postgresqlclient
```

## Usage

``` typescript
import { PGClient } from "@tomsd/postgresqlclient";

const uri = "postgres://...";
const tableName = "testTable";

(async () => {

  const client = new PGClient(uri, tableName);

  const record = await client.upsert({ name: "alice" });
  console.log(record); // { _id: "xxx", name: "alice" }

  console.log(
    await client.getAll()
  ); // [{ _id: "xxx", name: "alice" }]

  console.log(
    await client.get(record._id)
  ); // { _id: "xxx", name: "alice" }

  console.log(
    await client.upsert({
      ...record,
      name: "bob",
      age: 25
    })
  ); // { _id: "xxx", name: "bob", age: 25 }

  console.log(
    await client.remove(record._id)
  ); // true

})();
```
