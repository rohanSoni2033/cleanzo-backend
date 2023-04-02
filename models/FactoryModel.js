import db from "./../db/database.js";
class Factory {
    constructor(collection) {
        this.collection = collection;
    }

    async getAll(filter) {
        const results = await db.collection(this.collection).find();
        return results;
    }

    async getOne(filter) {

    }

    async getOneById(id) {

    }

    async createOne(data) {

    }

    async createMany(data) {

    }

    async deleteOne(filter) {

    }

    async deleteOneById(id) {

    }

    async deleteMany(filter) {

    }

    async updateOne(filter, data) {

    }

    async updateOneById(filter, data) {

    }

    async updateMany(filter, data) {

    }
}