import { v4 as uuidv4 } from "uuid";

// eslint-disable-next-line  @typescript-eslint/no-var-requires
const pg = require("knex");

const getPg = (connectionString: string): any =>
  pg({
    client: "pg",
    connection: connectionString,
  });

interface Record {
  id: string;
  data: any;
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

  public async getTable(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/return-await
    return await this.pg("information_schema.tables")
      .where("table_name", this.tableName)
      .first();
  }

  public async makeTable(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/return-await
    return await this.pg.schema.createTable(this.tableName, (t: any) => {
      t.uuid("id").primary();
      t.jsonb("data");
    });
  }

  public async dropTable(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/return-await
    return await this.pg.schema
      .dropTable(this.tableName)
      .then((result: any) => {
        this.initialized = false;
        return result;
      });
  }

  public destroy(): any {
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

  public async getAll(): Promise<any> {
    await this.ensureInitialized();
    // eslint-disable-next-line @typescript-eslint/return-await
    return await this.pg(this.tableName)
      .select("*")
      .then((records: Record[]) => records.map(({ data }) => data));
  }

  public async get(id: string): Promise<any> {
    await this.ensureInitialized();
    // eslint-disable-next-line @typescript-eslint/return-await
    return await this.pg(this.tableName)
      .where({ id })
      .first()
      .then((record: Record) => record?.data);
  }

  public async upsert(data: any): Promise<any> {
    const savingData = {
      _id: uuidv4(),
      ...data,
    };
    await this.ensureInitialized();
    // eslint-disable-next-line @typescript-eslint/return-await
    const record = await this.pg(this.tableName)
      .where({ id: savingData._id })
      .first();
    if (record != null) {
      // eslint-disable-next-line @typescript-eslint/return-await
      return await this.pg(this.tableName)
        .where({ id: savingData._id })
        .update({
          data: savingData,
        })
        .then(() => savingData);
    } else {
      // eslint-disable-next-line @typescript-eslint/return-await
      return await this.pg(this.tableName)
        .insert({
          id: savingData._id,
          data: savingData,
        })
        .then(() => savingData);
    }
  }

  public async remove(id: string): Promise<boolean> {
    await this.ensureInitialized();
    // eslint-disable-next-line @typescript-eslint/return-await
    return await this.pg(this.tableName)
      .where({ id })
      .del()
      .then(() => true);
  }
}
