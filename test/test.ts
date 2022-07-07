// @ts-ignore
import dotenv from "dotenv";
dotenv.config();

import {describe, it } from "mocha";
import { strict as assert } from "assert";
import { v4 as uuidv4 } from "uuid";

import { PGClient } from "../src/postgresqlclient";
const uri = process.env.POSTGRESQL_URI as string;
const tableName = uuidv4();

const client = new PGClient(uri, tableName);
const testingId = uuidv4();
const savingObj = {
  _id: testingId,
  name: "alice"
};


describe("PGClient", () => {
  after(async () => {
    await client.dropTable();
    client.destroy();
  });

  it("upsert()", async () => {
    const record = await client.upsert(savingObj);
    assert.equal(record.name, savingObj.name);
  });

  it("get()", async () => {
    const record = await client.get(testingId);
    assert.equal(record.name, savingObj.name);
  });

  it("getAll()", async () => {
    const records = await client.getAll();
    assert.equal(records.length, 1);
  });

  it("upsert()", async () => {
    const record = await client.upsert({
      ...savingObj,
      name: "bob"
    });
    assert.equal(record.name, "bob");
  });

  it("get() after updated", async () => {
    const record = await client.get(testingId);
    assert.equal(record.name, "bob");
  });

  it("remove()", async () => {
    const result = await client.remove(testingId);
    assert.equal(result, true);
  });

  it("getAll() after removal", async () => {
    const records = await client.getAll();
    assert.equal(records.length, 0);
  });

  it("get() after removal", async () => {
    const record = await client.get(testingId);
    assert.equal(record, undefined);
  });
});
