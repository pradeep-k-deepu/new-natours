const fs = require('fs');
const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const exp = require('constants');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/AppError');
const globalErrorController = require('./controllers/errorController');
const app = express();

//GLOBAL MIDDLEWARES

//SETTING SECURITY HTTP HEADERS
app.use(helmet());

//DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());

//DATA SANITIZATION AGAINST XSS ATTACKS
app.use(xss());

//PREVENTING PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'price',
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

//BODY PARSER MIDDLEWARE
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
// app.use(express.urlencoded({ extended: true, limit: '16kb' }));

//SETTING VIEW ENGINE
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//RATE LIMITER
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //1 hour
  message: 'too many requests... please try after an hour',
});

app.use('/api', limiter);

//MOUNTING A ROUTER
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRouter);

//UNHANDLED ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`this route is not yet defined ${req.originalUrl}`, 404));
});

//GLOBAL ERROR CONTROLLER
app.use(globalErrorController);
module.exports = app;
