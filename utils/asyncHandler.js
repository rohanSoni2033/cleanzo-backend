import errorController from '../error/errorController.js';

// it accepts a callback function as a parameter
const asyncHandler = callback => {
  return async (req, res, next) => {
    try {
      await callback(req, res, next);
    } catch (err) {
      errorController(err, res);
    }
  };
};

export default asyncHandler;
