const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name.'],
    },
    items: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Item',
      required: [true, 'Please provide outfit items.'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 2;
        },
        message: 'Outfit must contain at least 2 items.',
      },
    },
    category: {
      type: String,
      required: [true, 'Please provide a category.'],
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

const Outfit = mongoose.model('Outfit', outfitSchema);

module.exports = Outfit;
