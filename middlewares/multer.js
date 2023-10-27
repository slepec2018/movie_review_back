const multer = require('multer');

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => { 
  if (!file.mimetype.startsWith('image')) { 
    return cb(new Error('Please upload only images'), false);
  }
  
  cb(null, true);
};

exports.uploadImage = multer({ storage, fileFilter });