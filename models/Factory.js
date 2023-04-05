import db from "../db/database.js";
// direct interaction with the database
class Factory {
    constructor(collection) {
        this.collection = collection;
    }

    async createOne(data) {
        return await db.collection(this.collection).insertOne(data);
    }

    async getAll() {
        return await db.collection(this.collection).find();
    }

    async getOne(filter) {
        return await db.collection(this.collection).findOne(filter);
    }

    async getOneById(id) {
        return await db.collection(this.collection).findOne({ _id: new ObjectId(id) })
    }

    async updateOneById(id, data) {
        return await db.collection(this.collection).updateOne({ _id: new ObjectId(id) }, { $set: data });
    }

    async updateOne(filter, data) {
        return await db.collection(this.collection).updateOne(filter, { $set: data });
    }

    async updateMany(filter, data) {
        return await db.collection(this.collection).updateMany(filter, { $set: data });
    }

    async deleteOne(filter) {
        return await db.collection(this.collection).findOneAndDelete(filter);
    }

    async deleteOneById(id) {
        return await db.collection(this.collection).findOneAndDelete({ _id: new ObjectId(id) })
    }

    async deleteMany(filter) {
        return await db.collection(this.collection).deleteMany(filter);
    }
}

export default Factory;