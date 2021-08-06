const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'A TOUR MUST HAVE A NAME'],
    },
    duration: {
      type: Number,
      required: [true, 'A TOUR MUST HAVE A DURATION'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'A TOUR HAVE EITHER [EASY OR MEDIUM OR DIFFICULT] VALUES FOR DIFFICULTY',
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A TOUR MUST HAVE MAX GROUP-SIZE'],
    },
    price: {
      type: Number,
      required: [true, 'A TOUR MUST HAVE HAVE A PRICE'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val >= this.price;
        },
        message: 'DISCOUNT PRICE IS MUST LESSER THAN THE REGULAR PRICE',
      },
    },
    summary: {
      type: String,
      required: [true, 'A TOUR MUST HAVE A SUMMARY'],
    },
    description: String,
    ratingsAverage: {
      type: Number,
      default: 4.9,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    slug: String,
    startDates: [Date],
    images: [String],
    imageCover: String,
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre('save', async function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: 'name role photo',
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
