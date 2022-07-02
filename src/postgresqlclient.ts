
const pg = require("knex");
import { v4 as uuidv4 } from "uuid";

const getPg = (connectionString: string) => pg({
  client: "pg",
  connection: connectionString
});

type Record = {
  id: string;
  data: any;
};

export class PGClient {
  protected connectionString: string;
  protected tableName: string;
  protected initialized: boolean;
  protected pg: typeof pg;
  constructor(connectionString: string, tableName: string){
    this.connectionString = connectionString;
    this.tableName = tableName;
    this.initialized = false;
    this.pg = getPg(this.connectionString);
  }
  public async getTable(){
    return await this.pg("information_schema.tables")
      .where("table_name", this.tableName).first();
  }
  public async makeTable(){
    return await this.pg
      .schema
      .createTable(
        this.tableName,
        (t: any) => {
          t.uuid("id").primary();
          t.jsonb("data");
        }
      );
  }
  public destroy(){
    this.pg.destroy();
  }
  public async ensureInitialized(){
    if(this.initialized){return true;}
    const myTable = await this.getTable();
    if(myTable){
      this.initialized = true;
      return true;
    }
    return this.makeTable().then(() => {
      this.initialized = true;
      return true;
    });
  }
  public async getAll(){
    await this.ensureInitialized();
    return await this.pg(this.tableName)
      .select("*")
      .then((records: Record[]) => records.map(({ data }) => data));
  }
  public async get(id: string){
    await this.ensureInitialized();
    return await this.pg(this.tableName)
      .where({ id })
      .first()
      .then((record: Record) => record && record.data);
  }
  public async upsert(data: any){
    const savingData = {
      _id: uuidv4(),
      ...data
    };
    await this.ensureInitialized();
    const record = await this.pg(this.tableName).where({ id: savingData._id }).first();
    if(record){
      return await this.pg(this.tableName)
        .where({ id: savingData._id })
        .update({
          data: savingData
        })
        .then(() => savingData);
    }else{
      return await this.pg(this.tableName)
        .insert({
          id: savingData._id,
          data: savingData
        })
        .then(() => savingData);
    }
  }
  public async remove(id: string){
    return await this.pg(this.tableName)
      .where({ id })
      .del()
      .then(() => true);
  }
}
