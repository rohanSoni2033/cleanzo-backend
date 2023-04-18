import db from '../db/database.js';
// direct interaction with the database

import { ObjectId } from 'mongodb';

class Factory {
  constructor(collection) {
    this.collection = collection;
  }

  async createOne(data) {
    const { insertedId } = await db.collection(this.collection).insertOne(data);
    return insertedId.toString();
  }

  async getAll(query) {
    const results = db
      .collection(this.collection)
      .find(query ? query.filter : {})
      .sort(query ? query.sortQuery : {});

    return results.toArray();
  }

  async getOne(filter) {
    const result = await db.collection(this.collection).findOne(filter);
    return result;
  }

  async getOneById(id) {
    return await db
      .collection(this.collection)
      .findOne({ _id: new ObjectId(id) });
  }

  async updateOneById(id, data) {
    return await db
      .collection(this.collection)
      .updateOne({ _id: new ObjectId(id) }, { $set: data });
  }

  async updateOne(filter, data) {
    return await db
      .collection(this.collection)
      .updateOne(filter, { $set: data });
  }

  async updateMany(filter, data) {
    return await db
      .collection(this.collection)
      .updateMany(filter, { $set: data });
  }

  async deleteOne(filter) {
    return await db.collection(this.collection).findOneAndDelete(filter);
  }

  async deleteOneById(id) {
    return await db
      .collection(this.collection)
      .findOneAndDelete({ _id: new ObjectId(id) });
  }

  async deleteMany(filter) {
    return await db.collection(this.collection).deleteMany(filter);
  }
}

export default Factory;
