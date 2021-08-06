const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

router.get('/login', authController.isLoggedIn, viewController.getLoginPage);

router.get('/me', authController.protect, viewController.getAccountPage);

router.get(
  '/my-bookings',
  authController.isLoggedIn,
  viewController.getMyBookings
);
// router.post(
//   '/update-my-data',
//   authController.protect,
//   viewController.updateMyData
// );
module.exports = router;
