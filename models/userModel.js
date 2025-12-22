const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: [50, 'Name must be 50 characters at most.'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Please provide a username.'],
      unique: [true, 'Already used username.'],
      lowercase: true,
      trim: true,
      maxlength: [50, 'Username must be 50 characters at most.'],
      match: [/^(?!\.)(?!.*\.$)[a-zA-Z0-9_.]+$/, 'Username invalid format.'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address.'],
      unique: [true, 'Already used email address.'],
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email address.'],
    },
    country: {
      type: String,
    },
    photo: {
      type: String,
      default: 'default.png',
    },
    bio: {
      type: String,
      maxlength: [100, 'Bio must be 100 characters at most.'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    private: {
      type: Boolean,
      default: false,
    },
    searches: [
      {
        type: String,
        trim: true,
      },
    ],
    items: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Item',
      },
    ],
    followers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    requests: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
      minlength: [8, 'Password must be 8 characters at least.'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        validator: function (e) {
          return e === this.password;
        },
        message: 'Passwords do not match.',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('closets', {
  ref: 'Closet',
  foreignField: 'user',
  localField: '_id',
});

userSchema.virtual('outfits', {
  ref: 'Outfit',
  foreignField: 'user',
  localField: '_id',
});

userSchema.virtual('posts', {
  ref: 'Post',
  foreignField: 'user',
  localField: '_id',
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.passwordChangedAt = Date.now();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTIssuedAt < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
