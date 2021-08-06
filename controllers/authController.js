const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const Email = require('./../utils/Email');

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, res, statusCode) => {
  const token = createToken(user._id);
  let cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  } else if (process.env.NODE_ENV === 'development') {
    cookieOptions.secure = false;
  }
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  //create new user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  //send the welcome email
  const url = `${req.protocol}://localhost:3000/me`;
  await new Email(user, url).sendWelcome();

  //send the token to the client
  createSendToken(user, res, 201);
});

exports.login = catchAsync(async (req, res, next) => {
  //check if email and password exists
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('please provide both email and password', 400));
  }

  //check user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(user.password, password))) {
    return next(new AppError('invalid email or password'));
  }

  //if ok then send token to the client
  createSendToken(user, res, 200);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //getting the token and check its there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('you are not logged in! please login to get access')
    );
  }

  //verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //check if user still exists or not
  const currentUser = await User.findOne({ _id: decoded.id });

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );
  }

  //check if the user changes the password after the token was isssued
  if (currentUser.checkChangePasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'The user has recently changed his password... please login with the new password'
      )
    );
  }

  //if everything ok then grant access
  req.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    //getting the token and check its there
    if (req.cookies.jwt) {
      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

      if (!decoded) return next();

      //check if user still exists or not
      const currentUser = await User.findOne({ _id: decoded.id });

      if (!currentUser) {
        return next();
      }

      //check if the user changes the password after the token was isssued
      if (currentUser.checkChangePasswordAfter(decoded.iat)) {
        return next();
      }

      //if everything ok then grant access
      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }

  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You are not allowed to perform this action'));
    } else {
      next();
    }
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get the email
  const { email } = req.body;

  //check user exists based on the email provided by the user
  const user = await User.findOne({ email });

  if (!user) return next(new AppError('No user exist with that email id', 401));

  //if exists, then generate the password reset token
  const resetToken = user.generateResetToken();

  await user.save({ validateBeforeSave: false });
  console.log(resetToken);

  //send the reset token to the users email

  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'reset token sent to mail',
    });
  } catch (err) {
    console.log('ERROR SENDING THE MAIL', err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the mail... please try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //get the user based on the hashed token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('invalid token or token expired', 401));
  }
  //update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  //set the passwordChangedAt property
  user.passwordChangedAt = Date.now();

  await user.save();

  //log the user in, send the jwt

  createSendToken(user, res, 200);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body;

  //get the current user
  const user = await User.findOne({ _id: req.user._id }).select('+password');
  // check if user exists based on the current password
  if (!(await user.checkPassword(user.password, currentPassword))) {
    return next(new AppError('Your current password was wrong', 401));
  }

  //if user exists then update the password
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // login the user, send jwt
  createSendToken(user, res, 200);
});

const filterData = (obj, ...fields) => {
  let updateData = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) {
      updateData[el] = obj[el];
    }
  });
  return updateData;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  //if user try to update password than log an error message
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update... if u update your password then use /updateMyPassword route'
      )
    );
  }

  const updateData = filterData(req.body, 'name', 'email');
  updateData.photo = req.file.filename;
  //update the data
  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  //login the user , send jwt
  createSendToken(updatedUser, res, 200);
});
