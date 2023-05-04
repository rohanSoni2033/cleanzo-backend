import { ObjectId } from 'mongodb';
import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';

export const getAll = collection => {
  return asyncHandler(async (req, res, next) => {
    console.log(collection);
    const results = await collection.find().toArray();
    res.status(statusCode.OK).json({
      status: 'success',
      ok: true,
      data: {
        total: results.length,
        data: results,
      },
    });
  });
};

export const getOne = collection => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await collection.findOne({ _id: new ObjectId(id) });
    res.status(statusCode.OK).json({
      status: 'success',
      ok: true,
      data: result,
    });
  });
};

export const deleteOne = collection => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    await collection.deleteOne({ _id: new ObjectId(id) });
    res.status(statusCode.OK).json({
      status: 'success',
      ok: true,
    });
  });
};

export const updateOne = collection => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const data = req.body;

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
    res.status(statusCode.OK).json({
      status: 'success',
      ok: true,
    });
  });
};
