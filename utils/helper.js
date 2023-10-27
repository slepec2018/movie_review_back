const crypto = require('crypto');
const cloudinary = require('../cloud');

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

exports.uploadImageToCloud = async (file) => {
  const { secure_url: url, public_id } = await cloudinary.uploader.upload(file, { gravity: "face", height: 500, width: 500, crop: "thumb" });
  
  return { url, public_id };
}

exports.formatActor = (actor) => { 
  const { name, gender, about, _id, avatar } = actor;
  
  return {
    id: _id,
    name,
    about,
    gender,
    avatar: avatar?.url
  }
}