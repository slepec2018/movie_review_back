// С эти кодом происходит ошибки, поэтому закоментировал
// Причина ошибки при вызове PasswordResetToken он считает это ошибкой перезаписи
// Потому эта функция перенеслась в один контроллерс там где этот модуль базы данных создавался

// const { isValidObjectId } = require('mongoose');
// const PasswordResetToken = require('../models/PasswordResetToken');
// const { sendError } = require('../utils/helper');

// exports.isValidPassResetToken = async (req, res, next) => { 
//   const { token, userId } = req.body;

//   if (!token.trim() || !isValidObjectId(userId)) {
//     return sendError(res, 'Invalid request!');
//   }

//   const resetToken = await PasswordResetToken.findOne({ owner: userId });
  
//   if (!resetToken) {
//     return sendError(res, 'Unauthorized access, invalid request!');
//   }

//   const matched = await resetToken.compareToken(token);

//   if (!matched) {
//     return sendError(res, 'Unauthorized access, invalid request!');
//   }

//   req.resetToken = resetToken;

//   next();
// };