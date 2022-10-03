import { describe, it } from "mocha";
import { strict as assert } from "assert";
import { PgKvs } from "../src/pgkvs";

import { mock } from "sinon";

let store: PgKvs;
const pgUri = "postgres://...";
const tableName = "tableName";

describe("test", () => {
  before(() => {
    store = new PgKvs(pgUri, tableName);
  });
  it("getAll()", async () => {
    const mocked = mock(store);
    mocked
      .expects("ensureInitialized")
      .once()
      .withArgs()
      .returns(Promise.resolve(true));

    mocked
      .expects("pg")
      .once()
      .withArgs(tableName)
      .returns({
        select: async () =>
          await Promise.resolve([
            { id: "a", data: { name: "a" } },
            { id: "b", data: { name: "b" } },
          ]),
      });

    assert.equal(
      await store.getAll().then((items) => JSON.stringify(items)),
      JSON.stringify([{ name: "a" }, { name: "b" }])
    );

    mocked.verify();
    mocked.restore();
  });

  it("get()", async () => {
    const mocked = mock(store);
    mocked
      .expects("ensureInitialized")
      .once()
      .withArgs()
      .returns(Promise.resolve(true));

    mocked
      .expects("pg")
      .once()
      .withArgs(tableName)
      .returns({
        where: () => ({
          first: async () =>
            await Promise.resolve({
              data: { name: "dummyName" },
            }),
        }),
      });

    assert.equal(await store.get("test").then(({ name }) => name), "dummyName");

    mocked.verify();
    mocked.restore();
  });

  it("upsert() - update", async () => {
    const mocked = mock(store);
    mocked
      .expects("ensureInitialized")
      .once()
      .withArgs()
      .returns(Promise.resolve(true));

    mocked
      .expects("pg")
      .twice()
      .withArgs(tableName)
      .returns({
        where: ({ id }: { id: string }) => ({
          first: async () => await Promise.resolve({ id }),
          update: async () => await Promise.resolve({}),
        }),
      });

    assert.equal(
      await store.upsert({ name: "dummyName" }).then(({ name }) => name),
      "dummyName"
    );

    mocked.verify();
    mocked.restore();
  });

  it("upsert() - insert", async () => {
    const mocked = mock(store);
    mocked
      .expects("ensureInitialized")
      .once()
      .withArgs()
      .returns(Promise.resolve(true));

    mocked
      .expects("pg")
      .twice()
      .withArgs(tableName)
      .returns({
        where: () => ({
          first: async () => await Promise.resolve(undefined),
        }),
        insert: async () => await Promise.resolve({}),
      });

    assert.equal(
      await store.upsert({ name: "dummyName" }).then(({ name }) => name),
      "dummyName"
    );

    mocked.verify();
    mocked.restore();
  });

  it("remove()", async () => {
    const mocked = mock(store);
    mocked
      .expects("ensureInitialized")
      .once()
      .withArgs()
      .returns(Promise.resolve(true));

    mocked
      .expects("pg")
      .once()
      .withArgs(tableName)
      .returns({
        where: () => ({
          del: async () => await Promise.resolve({}),
        }),
      });

    assert.equal(await store.remove("dummyId"), true);

    mocked.verify();
    mocked.restore();
  });
});
