const stripe = require('stripe')(
  'sk_test_51JLIdwSHRlMWHn5YxXS8sV9ObmmkXFA2cVJoPD3UtsGGkY73xhGORJHZffjzyYZ46KbrfArySM0bBPhFFEGRIt7W008l0XTlwA'
);
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const handlerFactory = require('./handlerFactory');

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  //get the current tour
  const tour = await Tour.findById(req.params.tourId);

  //create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://localhost:3000/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://localhost:3000/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        // TODO: replace this with the `price` of the product you want to sell
        name: `${tour.name} Tour`,
        description: tour.summary,
        amount: tour.price,
        quantity: 1,
        currency: 'inr',
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
      },
    ],
    mode: 'payment',
  });

  //send session as a response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  const booking = await Booking.create({ tour, user, price });

  console.log(req.originalUrl);
  res.redirect(req.originalUrl.split('?')[0]);
  next();
});

exports.getAllBookings = handlerFactory.getAll(Booking);
exports.getBooking = handlerFactory.getOne(Booking, { path: 'reviews' });
exports.createBooking = handlerFactory.createOne(Booking);
exports.updateBooking = handlerFactory.updateOne(Booking);
exports.deleteBooking = handlerFactory.deleteOne(Booking);
