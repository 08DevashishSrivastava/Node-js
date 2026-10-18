const mongoose = require('mongoose');

const photoPostSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: [true, 'Caption is required'],
      trim: true,
      maxlength: 500,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
      match: [/^https:\/\/.+/i, 'Image URL must use HTTPS'],
    },
    imageKitFileId: {
      type: String,
      required: [true, 'ImageKit file ID is required'],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (document, result) => {
        delete result.imageKitFileId;
        return result;
      },
    },
  }
);

module.exports =
  mongoose.models.PhotoPost || mongoose.model('PhotoPost', photoPostSchema);
