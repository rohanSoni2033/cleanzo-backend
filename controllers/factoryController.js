import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';

export const getAll = Modal => {
  return asyncHandler(async (req, res, next) => {
    const results = await Modal.getAll();
    res.status(statusCode.OK).json({
      status: 'success',
      data: {
        total: results.length,
        data: results,
      },
    });
  });
};

export const getOne = Modal => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await Modal.getOneById(id);
    res.status(statusCode.OK).json({
      status: 'success',
      data: result,
    });
  });
};

export const deleteOne = Modal => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    await Modal.deleteOneById(id);
    res.status(statusCode.OK).json({
      status: 'success',
    });
  });
};

export const updateOne = Modal => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const data = req.body;
    await Modal.updateOneById(id, data);
    res.status(statusCode.OK).json({
      status: 'success',
    });
  });
};
