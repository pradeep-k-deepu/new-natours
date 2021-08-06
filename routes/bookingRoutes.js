const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.createCheckoutSession
);

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.createBooking
  );
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.updateBooking
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.deleteBooking
  );

module.exports = router;
