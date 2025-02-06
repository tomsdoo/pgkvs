import { v4 as uuidv4 } from "uuid";

// eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any,@typescript-eslint/no-require-imports
const pg: any = require("knex");

const getPg = (connectionString: string): unknown =>
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

export class PgKvs {
  protected connectionString: string;
  protected tableName: string;
  protected initialized: boolean;
  protected pg: typeof pg;
  constructor(connectionString: string, tableName: string) {
    this.connectionString = connectionString;
    this.tableName = tableName;
    this.initialized = false;
    this.pg = getPg(this.connectionString);
  }

  public async getTable(): Promise<ITable | undefined> {
    return (
      (await this.pg("information_schema.tables")
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .where("table_name", this.tableName)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .first()) as ITable | undefined
    );
  }

  public async makeTable(): Promise<IResult> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
    return (await this.pg.schema.createTable(this.tableName, (t: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      t.uuid("id").primary();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      t.jsonb("data");
    })) as IResult;
  }

  public async dropTable(): Promise<IResult> {
    return (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (await this.pg.schema
        .dropTable(this.tableName)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .then((result: IResult) => {
          this.initialized = false;
          return result;
        })) as IResult
    );
  }

  public destroy(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.pg.destroy();
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

  public async getAll<T = unknown>(): Promise<T[]> {
    await this.ensureInitialized();
    return (
      (await this.pg(this.tableName)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .select("*")
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .then((records: Record[]) => records.map(({ data }) => data))) as T[]
    );
  }

  public async get<T = unknown>(id: string): Promise<T> {
    await this.ensureInitialized();
    return (
      (await this.pg(this.tableName)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .where({ id })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .first()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .then((record: Record) => record?.data)) as T
    );
  }

  public async upsert<T = unknown>(
    data: Omit<T, "_id"> & { _id?: string },
  ): Promise<T> {
    const savingData = {
      _id: uuidv4(),
      ...data,
    };
    await this.ensureInitialized();
    const record = (await this.pg(this.tableName)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .where({ id: savingData._id })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .first()) as { id: string } | undefined;
    if (record != null) {
      return (
        (await this.pg(this.tableName)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .where({ id: savingData._id })
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .update({
            data: savingData,
          })
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .then(() => savingData)) as T
      );
    } else {
      return (
        (await this.pg(this.tableName)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .insert({
            id: savingData._id,
            data: savingData,
          })
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .then(() => savingData)) as T
      );
    }
  }

  public async remove(id: string): Promise<boolean> {
    await this.ensureInitialized();
    return (
      (await this.pg(this.tableName)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .where({ id })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .del()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .then(() => true)) as boolean
    );
  }
}
