const AppError = require('../utils/AppError');

const sendErrorDev = (req, res, err) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(err.statusCode).render('alert', {
      msg: err.message,
    });
  }
};

const sendErrorProd = (req, res, err) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'something went wrong... please try again later',
      });
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render('alert', {
        msg: err.message,
      });
    } else {
      res.status(500).render('alert', {
        msg: 'something went wrong... please try again later',
      });
    }
  }
};

const handleCastError = (err) => {
  const message = `invalid ${err.path}:${err.value}`;

  return new AppError(message, 404);
};

const handleDuplicateFields = (err) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/g);
  const message = `duplicate field value ${value}... please use another value`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const message = Object.values(err.errors)
    .map((el) => el.message)
    .join('... ');
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('invalid token... please login again', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('your token was expired... please login again', 401);
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(req, res, err);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') {
      err = handleCastError(err);
    } else if (err.name === 'MongoError') {
      err = handleDuplicateFields(err);
    } else if (err.name === 'ValidationError') {
      err = handleValidationError(err);
    } else if (err.name === 'JsonWebTokenError') {
      err = handleJWTError(err);
    } else if (err.name === 'TokenExpiredError') {
      err = handleJWTExpiredError(err);
    }
    sendErrorProd(req, res, err);
  }
  next();
};
