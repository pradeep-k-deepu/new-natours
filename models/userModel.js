const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'PLEASE TELL US YOUR NAME'],
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'PLEASE PROVIDE UR EMAIL'],
      validate: [validator.isEmail, 'PLEASE PROVIDE A VALID EMAIL'],
    },
    photo: String,
    role: {
      type: String,
      enum: {
        values: ['user', 'guide', 'lead-guide', 'admin'],
        message: 'ROLE CONTAINS ONLY [USER  GUIDE  LEAD-GUIDE] VALUES',
      },
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'PLEASE PROVIDE A PASSWORD'],
      minlength: [8, 'PASSWORD MUST CONTAIN MINIMUM OF 8 CHARACTERS'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: 'PASSWORD AND PASSWORD CONFIRM MUST BE THE SAME',
      },
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  //if password is not modified then simply go to the next middleware
  if (!this.isModified('password')) return next();

  // hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //delete the password Confirm field
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.checkPassword = async function (
  hashedPassword,
  userPassword
) {
  return await bcrypt.compare(userPassword, hashedPassword);
};

userSchema.methods.checkChangePasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedAt = this.passwordChangedAt.getTime();
    const tokenIssuedAt = jwtTimestamp * 1000;

    if (passwordChangedAt > tokenIssuedAt) {
      return true;
    } else {
      return false;
    }
  }
  return false;
};

userSchema.methods.generateResetToken = function () {
  //generate random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  //hash the reset token and save it to the database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  //return the reset token
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
