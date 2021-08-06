const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

exports.getOverview = async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    tours,
    title: 'Natours | All Tours',
  });
};

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
  });

  if (!tour) {
    return next(new AppError('No Tour found with that id', 404));
  }
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      tour,
      title: `${tour.name} Tour`,
    });
});

exports.getLoginPage = (req, res) => {
  res.status(200).render('login', {
    title: 'Log in',
  });
};

exports.getAccountPage = (req, res) => {
  res.status(200).render('account', {
    user: req.user,
    title: 'My Account',
  });
};

exports.getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIds = bookings.map((booking) => booking.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  if (tours.length <= 0)
    return next(new AppError('No tour booked... please book a tour', 404));

  res.status(200).render('overview', {
    tours,
    title: 'My Bookings',
  });
});

// exports.updateMyData = async (req, res) => {
//   const user = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   res.status(200).render('account', {
//     user,
//     title: 'My Account',
//   });
// };
