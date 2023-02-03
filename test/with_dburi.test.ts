import { describe, it } from "mocha";
import { strict as assert } from "assert";
import { v4 as uuidv4 } from "uuid";
import { PgKvs } from "../src/pgkvs";
import dotenv from "dotenv";
dotenv.config();

const uri = "postgres://postgres:password@localhost:5432/testdb";
const tableName = uuidv4();

const store = new PgKvs(uri, tableName);
const testingId = uuidv4();
const savingObj = {
  _id: testingId,
  name: "alice",
};

describe("PgKvs", () => {
  after(async () => {
    await store.dropTable();
    store.destroy();
  });

  it("upsert()", async () => {
    const record = await store.upsert(savingObj);
    assert.equal(record.name, savingObj.name);
  });

  it("get()", async () => {
    const record = await store.get(testingId);
    assert.equal(record.name, savingObj.name);
  });

  it("getAll()", async () => {
    const records = await store.getAll();
    assert.equal(records.length, 1);
  });

  it("upsert()", async () => {
    const record = await store.upsert({
      ...savingObj,
      name: "bob",
    });
    assert.equal(record.name, "bob");
  });

  it("get() after updated", async () => {
    const record = await store.get(testingId);
    assert.equal(record.name, "bob");
  });

  it("remove()", async () => {
    const result = await store.remove(testingId);
    assert.equal(result, true);
  });

  it("getAll() after removal", async () => {
    const records = await store.getAll();
    assert.equal(records.length, 0);
  });

  it("get() after removal", async () => {
    const record = await store.get(testingId);
    assert.equal(record, undefined);
  });
});
