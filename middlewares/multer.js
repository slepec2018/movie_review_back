const multer = require('multer');

const storage = multer.diskStorage({});

const imageFileFilter = (req, file, cb) => { 
  if (!file.mimetype.startsWith('image')) { 
    return cb(new Error('Please upload only images'), false);
  }
  
  cb(null, true);
};

const videoFileFilter = (req, file, cb) => { 
  if (!file.mimetype.startsWith('video')) { 
    return cb(new Error('Please upload only images'), false);
  }
  
  cb(null, true);
};

exports.uploadImage = multer({ storage, imageFileFilter });
exports.uploadVideo = multer({ storage, videoFileFilter });