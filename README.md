# @tomsd/postgresqlclient

It's a handy postgresql client for easy-use.

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
  console.log(await client.getAll());

  const record = await client.upsert({ name: "alice" });
  console.log(record);
  console.log(await client.get(record._id));
  console.log(await client.getAll());
  console.log(await client.remove(record._id));
  console.log(await client.getAll());

})();
```
