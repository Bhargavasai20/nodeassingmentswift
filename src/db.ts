import { MongoClient, Db } from "mongodb";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "nodeassignmentswift";

let db: Db | null = null;

export async function getDB(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db(dbName);
  }
  return db;
}
