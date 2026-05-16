const mongoose = require('mongoose');

const closetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for your closet.'],
      maxlength: [50, 'Name must be 50 characters at most.'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Closet must belong to a user.'],
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
      },
    ],
    photoBlob: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Closet = mongoose.model('Closet', closetSchema);

module.exports = Closet;
