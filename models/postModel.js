const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
    },
    postType: {
      type: String,
      enum: ['item', 'outfit', 'photo'],
      required: true,
    },
    item: {
      type: mongoose.Schema.ObjectId,
      ref: 'Item',
      required: function () {
        return this.postType === 'item';
      },
    },
    outfit: {
      type: mongoose.Schema.ObjectId,
      ref: 'Outfit',
      required: function () {
        return this.postType === 'outfit';
      },
    },
    photoBlob: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

postSchema.pre('validate', function (next) {
  if (this.postType === 'item' && (this.outfit || this.photoBlob)) {
    throw new AppError('Item posts must only have an item.', 400);
  }
  if (this.postType === 'outfit' && (this.item || this.photoBlob)) {
    throw new AppError('Outfit posts must only have an outfit.', 400);
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
