import { v4 as uuidv4 } from "uuid";
import { default as knex, type Knex } from "knex";

const pg = knex;

const getPg = (connectionString: string): Knex =>
  pg({
    client: "pg",
    connection: connectionString,
  });

interface Record<T = unknown> {
  id: string;
  data: T;
}

interface ITable {
  table_catalog: string;
  table_schema: string;
  table_name: string;
  table_type: string;
}

interface IResult {
  command: string;
}

export class PgKvs<T = unknown> {
  protected connectionString: string;
  protected tableName: string;
  protected initialized: boolean;
  protected pg: Knex;
  constructor(connectionString: string, tableName: string) {
    this.connectionString = connectionString;
    this.tableName = tableName;
    this.initialized = false;
    this.pg = getPg(this.connectionString);
  }

  public async getTable(): Promise<ITable | undefined> {
    return (await this.pg("information_schema.tables")
      .where("table_name", this.tableName)
      .first()) as ITable | undefined;
  }

  public async makeTable(): Promise<IResult> {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    return (await this.pg.schema.createTable(this.tableName, (t) => {
      t.uuid("id").primary();
      t.jsonb("data");
    })) as unknown as IResult;
  }

  public async dropTable(): Promise<IResult> {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const result = await this.pg.schema.dropTable(this.tableName);
    this.initialized = false;
    return result as unknown as IResult;
  }

  public destroy(): void {
    void this.pg.destroy();
  }

  public async ensureInitialized(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    const myTable = await this.getTable();
    if (myTable != null) {
      this.initialized = true;
      return true;
    }
    return await this.makeTable().then(() => {
      this.initialized = true;
      return true;
    });
  }

  public async getAll(): Promise<T[]> {
    await this.ensureInitialized();
    return await this.pg(this.tableName)
      .select("*")
      .then((records: Array<Record<T>>) => records.map(({ data }) => data));
  }

  public async get(id: string): Promise<T | undefined> {
    await this.ensureInitialized();
    return await this.pg(this.tableName)
      .where({ id })
      .first()
      .then((record: Record<T>) => record?.data);
  }

  public async upsert(data: Omit<T, "_id"> & { _id?: string }): Promise<T> {
    const savingData = {
      _id: uuidv4(),
      ...data,
    };
    await this.ensureInitialized();
    const record = (await this.pg(this.tableName)
      .where({ id: savingData._id })
      .first()) as { id: string } | undefined;
    if (record != null) {
      return (await this.pg(this.tableName)
        .where({ id: savingData._id })
        .update({
          data: savingData,
        })
        .then(() => savingData)) as T;
    } else {
      return (await this.pg(this.tableName)
        .insert({
          id: savingData._id,
          data: savingData,
        })
        .then(() => savingData)) as T;
    }
  }

  public async remove(id: string): Promise<boolean> {
    await this.ensureInitialized();
    return await this.pg(this.tableName)
      .where({ id })
      .del()
      .then(() => true);
  }
}
