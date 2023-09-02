const jwt = require('jsonwebtoken');
const User = require('../models/user');
const EmailVerificationToken = require('../models/emailVerificationToken');
const PasswordResetToken = require('../models/passwordResetToken');

const { isValidObjectId, findByIdAndRemove } = require('mongoose');

const { generateOTP, generateMailTransporter } = require('../utils/mail');
const { sendError, generateRandomBytes } = require('../utils/helper');

exports.create = async (req, res) => { 
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });
  if (oldUser) {
    return sendError(res, 'This email is already in use!');
  }

  const newUser = new User({ name, email, password });
  await newUser.save()

  let OTP = generateOTP(6);

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  const transport = generateMailTransporter();

  transport.sendMail({
    from: 'verification@rewieapp.com',
    to: newUser.email,
    subject: 'Email Verification',
    html: `
      <p>Your verification OTP</p>
      <h1>${OTP}</h1>
    `,
  });

  res.status(201).json({message: "Please verify your email. OTP has been sent to your email account!"});
}

exports.verifyEmail = async (req, res) => { 
  const { userId, OTP } = req.body;

  if (!isValidObjectId(userId)) {
    return sendError(res, 'Invalid user!');
  }

  const user = await User.findById(userId);

  if (!user) {
    return sendError(res, 'User not found!', 404);
  }

  if (user.isVerified) {
    return sendError(res, 'User is already verified!');
  }

  const token = await EmailVerificationToken.findOne({ owner: userId });

  if (!token) {
    return sendError(res, 'token not found!');
  }

  const isMatched = await token.compareToken(OTP);

  console.log(isMatched);

  if (!isMatched) {
    return sendError(res, 'Please submit a valid OTP!');
  }

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndRemove(token._id);

  const transport = generateMailTransporter();

  transport.sendMail({
    from: 'verification@rewieapp.com',
    to: user.email,
    subject: 'Welcome Email',
    html: `
      <h1>Welcome to our app and thanks for choosing us.</h1>
    `,
  });

  res.json({ message: 'Your email is verified.' });
};

exports.resendEmailVerificationToken = async (req, res) => { 
  const { userId } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return sendError(res, 'User not found!');
  }

  if (user.isVerified) {
    return sendError(res, 'This email id is already verified!');
  }

  const alreadyHasToken = await EmailVerificationToken.findOne({ owner: userId });

  if (alreadyHasToken) { 
    return sendError(res, 'Only after one hour you can request for another token!');
  }

  let OTP = generateOTP(6);

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  const transport = generateMailTransporter();

  transport.sendMail({
    from: 'verification@rewieapp.com',
    to: user.email,
    subject: 'Email Verification',
    html: `
      <p>Your verification OTP</p>
      <h1>${OTP}</h1>
    `,
  });

  res.json({ message: 'New OTP has been sent to your registered email account.' });
};

exports.forgetPassword = async (req, res) => { 
  const { email } = req.body;

  if (!email) {
    return sendError(res, 'email is missing!');
  }

  const user = await User.findOne({ email });

  if (!user) {
    return sendError(res, 'User not found!', 404);
  }

  const alreadyHasToken = await PasswordResetToken.findOne({ owner: user._id });

  if (alreadyHasToken) { 
    return sendError(res, 'Only after one hour you can request for another token!');
  }

  const token = await generateRandomBytes();

  const newPasswordResetToken = new PasswordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

  const transport = generateMailTransporter();

  transport.sendMail({
    from: 'security@rewieapp.com',
    to: user.email,
    subject: 'Reset Password Link',
    html: `
      <p>Click here to reset password</p>
      <a href="${resetPasswordUrl}">Change Password</a>
    `,
  });

  res.json({ message: 'Link sent to your email!' });
};

exports.isValidPassResetToken = async (req, res, next) => { 
  const { token, userId } = req.body;

  if (!token.trim() || !isValidObjectId(userId)) {
    return sendError(res, 'Invalid request!');
  }

  const resetToken = await PasswordResetToken.findOne({ owner: userId });
  
  if (!resetToken) {
    return sendError(res, 'Unauthorized access, invalid request!');
  }

  const matched = await resetToken.compareToken(token);

  if (!matched) {
    return sendError(res, 'Unauthorized access, invalid request!');
  }

  req.resetToken = resetToken;

  next();
};

exports.sendResetPasswordTokenStatus = async (req, res) => { 
  res.json({ valid: true })
};

exports.resetPassword = async (req, res) => { 
  const { newPassword, userId } = req.body;
  
  const user = await User.findById(userId);

  const matched = await user.comparePassword(newPassword);

  if (matched) {
    return sendError(res, 'Rhe new password must be different from the old one!');
  }

  user.password = newPassword;
  await user.save();

  await PasswordResetToken.findByIdAndRemove(req.resetToken._id);

  const transport = generateMailTransporter();

  transport.sendMail({
    from: 'security@rewieapp.com',
    to: user.email,
    subject: 'Password Reset Successfully',
    html: `
      <h1>Password Reset Successfully</h1>
      <p>Now you can use new password.</p>
    `,
  });

  res.json({ message: 'Password reset successfully, now you can use new password.'});
};

exports.signIn = async (req, res, next) => { 
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return sendError(res, 'Email/Password mismatch!');
  }

  const matched = await user.comparePassword(password);

  if (!matched) {
    return sendError(res, 'Email/Password mismatch!');
  }

  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res.json({ user: {id: user._id, name: user.name, token: jwtToken} });
}