import "dotenv/config";

import { MongoClient } from "mongodb";
import { DB_NAME } from "../constants";

const { DB_URI } = process.env;

if (!DB_URI) {
  throw new Error("DB_URI env not provided");
}

const client = new MongoClient(DB_URI);
let changeQueue: any = [];

async function init() {
  try {
    await client.connect();
    console.log("Connected to the database");
    const db = client.db(DB_NAME).watch();

    db.on("change", (data: any) => {
      changeQueue.push(data.fullDocument);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

export { client, init, changeQueue };
