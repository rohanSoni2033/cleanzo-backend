const globalErrorHandler = (err, res) => {
  let statusCode, message;

  if (!err.isOperational) {
    if (err.name === 'BodyParserError') {
      message = err.message;
    }
  } else {
    message = err.message || 'something went wrong';
    statusCode = err.statusCode || 404;
  }

  if (process.env.NODE_ENV === 'development') {
    let stack = err.stack || 'stack not defined';
    return res.status(statusCode || 404).json({
      statusCode: statusCode,
      errorName: err.name,
      status: 'fail',
      message: message,
      stack: stack.toString(),
    });
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(statusCode).json({
      status: 'fail',
      message: message,
    });
  }

  if (!process.env.NODE_ENV) {
    res.status(404).json({
      message: 'node environment is not defined',
    });
  }
};

export default globalErrorHandler;
