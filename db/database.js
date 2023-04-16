import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';

// connection uri for connecting with the mongodb database
// const connectionUri = process.env.connectionUriHosted.replace("${PASSWORD}", process.env.databasePassword).replace("${USERNAME}", process.env.databaseUsername);

// const connectionUri = 'mongodb://127.0.0.1:27017';
const connectionUri = 'mongodb://127.0.0.1:27017';

const databaseName = process.env.database;

const main = async function () {
  const mongoClient = new MongoClient(connectionUri);
  try {
    const dbClient = await mongoClient.connect();
    console.log('🚀 successfully connected with the database');
    return dbClient.db(databaseName);
  } catch (err) {
    console.log('something went wrong with the database ❌');
  }
};

export default await main();
