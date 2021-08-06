const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.get('/tourStats', tourController.getTourStats);
router.get(
  '/top5Cheap',
  tourController.getCheapTours,
  tourController.getAllTours
);
router.get(
  '/monthlyPlan/:year',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
);

router.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  tourController.getToursWithIn
);

router.get('/distances/:latlng/unit/:unit', tourController.getDistance);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourPhoto,
    tourController.resizeTourPhoto,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

router.use('/:tourId/reviews', reviewRouter);
module.exports = router;
