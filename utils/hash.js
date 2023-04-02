import crypto from 'crypto';

class HashError extends Error {
  constructor(message) {
    super(message);
    this.name = 'HashError';
    this.statusCode = 400;
    Error.captureStackTrace(this);
  }
}

/** 
 * @params
 * data : Object
 * */
export const generate = function (data) {
  return new Promise((resolve, reject) => {
    try {
      if (!data) reject(new HashError('data is not defined'));
      if (typeof data === 'object') {
        const stringJson = JSON.stringify(data);
        var hash = crypto
          .createHmac('sha256', 'THIS_IS_SECRET_FOR_NOW')
          .update(stringJson)
          .digest('hex');

        return resolve(hash);
      }
      reject(new HashError('failed to hash the data'));
    } catch (err) {
      reject(new HashError(err.message));
    }
  });
};

export const compare = function (data, encrypted) {
  return new Promise(async (resolve, reject) => {
    try {
      // check if the data and encrypted is string or not
      if (typeof data === 'object' && typeof encrypted === 'string') {
        // first hash the data and then check if they are hashed data and encrypted are equal
        const result = (await generate(data)) === encrypted;
        // result could be either true or false
        resolve(result);
      }
    } catch (err) {
      reject(new HashError(err.message));
    }
  });
};
