import { beforeEach, describe, it, expect, vi } from "vitest";
import { PgKvs } from "../src/pgkvs";

vi.mock("uuid", () => ({
  v4() {
    return "dummyUuid";
  },
}));

let store: PgKvs;
const pgUri = "postgres://...";
const tableName = "tableName";

describe("test", () => {
  beforeEach(() => {
    store = new PgKvs(pgUri, tableName);
  });

  it("getAll()", async () => {
    vi.spyOn(store, "ensureInitialized").mockResolvedValue(true);

    const spySelect = vi.fn(
      async () =>
        await Promise.resolve([
          { id: "a", data: { name: "a" } },
          { id: "b", data: { name: "b" } },
        ])
    );

    // @ts-expect-error
    const spyPg = vi.spyOn(store, "pg").mockImplementation(() => ({
      select: spySelect,
    }));

    await expect(store.getAll()).resolves.toEqual([
      { name: "a" },
      { name: "b" },
    ]);
    expect(spyPg).toHaveBeenCalledWith(tableName);
    expect(spySelect).toHaveBeenCalledWith("*");
  });

  it("get()", async () => {
    vi.spyOn(store, "ensureInitialized").mockResolvedValue(true);
    const spyFirst = vi.fn(
      async () =>
        await Promise.resolve({
          data: { name: "dummyName" },
        })
    );
    const spyWhere = vi.fn(() => ({
      first: spyFirst,
    }));
    // @ts-expect-error
    const spyPg = vi.spyOn(store, "pg").mockImplementation(() => ({
      where: spyWhere,
    }));
    await expect(store.get("dummyId")).resolves.toEqual({
      name: "dummyName",
    });
    expect(spyPg).toHaveBeenCalledWith(tableName);
    expect(spyWhere).toHaveBeenCalledWith({ id: "dummyId" });
    expect(spyFirst).toHaveBeenCalledWith();
  });

  it("upsert() - update", async () => {
    vi.spyOn(store, "ensureInitialized").mockResolvedValue(true);
    const spyFirst = vi.fn(
      async () => await Promise.resolve({ id: "dummyUuid" })
    );
    const spyUpdate = vi.fn(async () => await Promise.resolve({}));
    const spyWhere = vi.fn(() => ({
      first: spyFirst,
      update: spyUpdate,
    }));
    // @ts-expect-error
    const spyPg = vi.spyOn(store, "pg").mockImplementation(() => ({
      where: spyWhere,
    }));
    await expect(store.upsert({ name: "dummyName" })).resolves.toEqual({
      _id: "dummyUuid",
      name: "dummyName",
    });
    expect(spyPg).toHaveBeenCalledWith(tableName);
    expect(spyWhere).toHaveBeenCalledWith({ id: "dummyUuid" });
    expect(spyFirst).toHaveBeenCalledWith();
    expect(spyUpdate).toHaveBeenCalledWith({
      data: {
        _id: "dummyUuid",
        name: "dummyName",
      },
    });
  });

  it("upsert() - insert", async () => {
    vi.spyOn(store, "ensureInitialized").mockResolvedValue(true);
    const spyFirst = vi.fn(async () => await Promise.resolve(undefined));
    const spyInsert = vi.fn(async () => await Promise.resolve({}));
    const spyWhere = vi.fn(() => ({
      first: spyFirst,
    }));
    // @ts-expect-error
    const spyPg = vi.spyOn(store, "pg").mockImplementation(() => ({
      where: spyWhere,
      insert: spyInsert,
    }));
    await expect(store.upsert({ name: "dummyName" })).resolves.toEqual({
      _id: "dummyUuid",
      name: "dummyName",
    });
    expect(spyPg).toHaveBeenCalledWith(tableName);
    expect(spyWhere).toHaveBeenCalledWith({ id: "dummyUuid" });
    expect(spyInsert).toHaveBeenCalledWith({
      id: "dummyUuid",
      data: {
        _id: "dummyUuid",
        name: "dummyName",
      },
    });
  });

  it("remove()", async () => {
    vi.spyOn(store, "ensureInitialized").mockResolvedValue(true);
    const spyDelete = vi.fn(async () => await Promise.resolve(undefined));
    const spyWhere = vi.fn(() => ({
      del: spyDelete,
    }));
    // @ts-expect-error
    const spyPg = vi.spyOn(store, "pg").mockImplementation(() => ({
      where: spyWhere,
    }));
    await expect(store.remove("dummyId")).resolves.toBe(true);
    expect(spyPg).toHaveBeenCalledWith(tableName);
    expect(spyWhere).toHaveBeenCalledWith({ id: "dummyId" });
    expect(spyDelete).toHaveBeenCalledWith();
  });
});
