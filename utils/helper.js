const crypto = require('crypto');

exports.sendError = (res, error, statusCode = 401) => {
  res.status(statusCode).json({ error: error })
}

exports.generateRandomBytes = () => {
  return new Promise((resolve, reject) => { 
    crypto.randomBytes(30, async (err, buff) => { 
      if (err) {
        return reject(err);
      }
  
      const buffString = buff.toString('hex');

      resolve(buffString);
    });
  })
}

exports.handleNotFound = (req, res, next) => { 
  this.sendError(res, 'Route not found!', 404);
}