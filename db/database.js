import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient, ServerApiVersion } from 'mongodb';

// connection uri for connecting with the mongodb database
const connectionUri = process.env.connectionUriHosted
  .replace('${PASSWORD}', process.env.databasePassword)
  .replace('${USERNAME}', process.env.databaseUsername);

// const connectionUri = 'mongodb://127.0.0.1:27017';

const databaseName = process.env.database;

const main = async function () {
  const client = new MongoClient(connectionUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    const db = client.db(databaseName);
    console.log('🚀 successfully connected with the database');
    return db;
  } catch (err) {
    console.log('something went wrong with the database ❌');
  }
};

export default await main();
