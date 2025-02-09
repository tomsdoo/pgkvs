import { afterAll, describe, it, expect } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { PgKvs } from "@/pgkvs";

type DummyType = {
  _id: string;
  name: string;
}

const uri = "postgres://postgres:password@localhost:5432/testdb";
const tableName = uuidv4();

const store = new PgKvs<DummyType>(uri, tableName);
const testingId = uuidv4();
const savingObj: DummyType = {
  _id: testingId,
  name: "alice",
};

describe("PgKvs", () => {
  afterAll(async () => {
    await store.dropTable();
    store.destroy();
  });

  it("upsert()", async () => {
    const record = await store.upsert(savingObj);
    expect(record).toHaveProperty("name", savingObj.name);
  });

  it("get()", async () => {
    const record = await store.get(testingId);
    expect(record).toHaveProperty("name", savingObj.name);
  });

  it("getAll()", async () => {
    const records = await store.getAll();
    expect(records).toHaveLength(1);
  });

  it("upsert()", async () => {
    const record = await store.upsert({
      ...savingObj,
      name: "bob",
    });
    expect(record).toHaveProperty("name", "bob");
  });

  it("get() after updated", async () => {
    const record = await store.get(testingId);
    expect(record).toHaveProperty("name", "bob");
  });

  it("remove()", async () => {
    const result = await store.remove(testingId);
    expect(result).toBe(true);
  });

  it("getAll() after removal", async () => {
    const records = await store.getAll();
    expect(records).toHaveLength(0);
  });

  it("get() after removal", async () => {
    const record = await store.get(testingId);
    expect(record).toBeUndefined();
  });
});
