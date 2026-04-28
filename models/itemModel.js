const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name.'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category.'],
    },
    color: {
      type: String,
      required: [true, 'Please provide a color.'],
    },
    fabric: {
      type: String,
      default: 'Unknown',
    },
    brand: {
      type: String,
      default: 'Unknown',
    },
    photoBlob: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
