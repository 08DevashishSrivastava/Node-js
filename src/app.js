const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const Note = require('./models/post.model');
const PhotoPost = require('./models/photo-post.model');
const { uploadImage, deleteImage, isConfigured: isImageKitConfigured } = require('./services/storage.services');

const app = express();
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      callback(Object.assign(new Error('Upload a JPEG, PNG, GIF, or WebP image.'), { statusCode: 400 }));
      return;
    }
    callback(null, true);
  },
});

function imageMatchesMimeType(buffer, mimeType) {
  if (mimeType === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mimeType === 'image/gif') {
    const signature = buffer.subarray(0, 6).toString('ascii');
    return signature === 'GIF87a' || signature === 'GIF89a';
  }
  if (mimeType === 'image/webp') {
    return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  }
  return false;
}

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(Object.assign(new Error('CORS policy does not allow this origin'), { statusCode: 403 }));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isConnected = dbState === 1;

  res.status(isConnected ? 200 : 503).json({
    success: isConnected,
    message: isConnected ? 'Backend and database are healthy.' : 'Database is not connected.',
    data: {
      status: isConnected ? 'healthy' : 'unhealthy',
      dbConnected: isConnected,
      dbState,
      imageKitConfigured: isImageKitConfigured(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.get('/api/notes', async (req, res, next) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: notes,
      message: 'Notes fetched successfully',
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID.',
      });
    }

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: note,
      message: 'Note fetched successfully',
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/notes', async (req, res, next) => {
  try {
    const { title, description } = req.body || {};

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.',
      });
    }

    const note = await Note.create({ title, description });
    return res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    return next(error);
  }
});

app.patch('/api/notes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID.',
      });
    }

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one field to update.',
      });
    }

    const note = await Note.findByIdAndUpdate(
      id,
      { $set: { ...(title ? { title } : {}), ...(description ? { description } : {}) } },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/notes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID.',
      });
    }

    const note = await Note.findByIdAndDelete(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      data: note,
    });
  } catch (error) {
    return next(error);
  }
});

async function listPhotoPosts(req, res) {
  const posts = await PhotoPost.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: posts,
    message: 'Posts fetched successfully',
  });
}

async function createPhotoPost(req, res) {
  const caption = typeof req.body?.caption === 'string' ? req.body.caption.trim() : '';
  if (!caption) {
    const error = new Error('Caption is required.');
    error.statusCode = 400;
    throw error;
  }
  if (caption.length > 500) {
    const error = new Error('Caption must be 500 characters or fewer.');
    error.statusCode = 400;
    throw error;
  }
  if (!req.file) {
    const error = new Error('An image file is required.');
    error.statusCode = 400;
    throw error;
  }
  if (!imageMatchesMimeType(req.file.buffer, req.file.mimetype)) {
    const error = new Error('The uploaded file content is not a supported image.');
    error.statusCode = 400;
    throw error;
  }

  const fileExtension = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  }[req.file.mimetype];
  const fileName = `${Date.now()}-upload.${fileExtension}`;
  const uploadedImage = await uploadImage(req.file.buffer, fileName);
  try {
    const post = await PhotoPost.create({
      caption,
      imageUrl: uploadedImage.url,
      imageKitFileId: uploadedImage.fileId,
    });
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    try {
      await deleteImage(uploadedImage.fileId);
    } catch (cleanupError) {
      console.error('ImageKit cleanup failed after database write failure:', cleanupError.message);
    }
    throw error;
  }
}

async function deletePhotoPost(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const error = new Error('Invalid post ID.');
    error.statusCode = 400;
    throw error;
  }

  const post = await PhotoPost.findById(req.params.id).select('+imageKitFileId');
  if (!post) {
    const error = new Error('Post not found.');
    error.statusCode = 404;
    throw error;
  }

  await deleteImage(post.imageKitFileId);
  await post.deleteOne();
  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
    data: { _id: post._id },
  });
}

app.get(['/api/posts', '/posts'], listPhotoPosts);
app.post(['/api/posts', '/create-post'], imageUpload.single('image'), createPhotoPost);
app.delete(['/api/posts/:id', '/posts/:id'], deletePhotoPost);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof multer.MulterError) {
    error.statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    error.message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be 5 MB or smaller.'
        : 'The image upload request is invalid.';
  } else if (error.name === 'ValidationError') {
    error.statusCode = 400;
    error.message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(' ');
  } else if (error.name === 'CastError') {
    error.statusCode = 400;
    error.message = 'A request contains an invalid identifier or value.';
  }

  const statusCode = error.statusCode || (error.status < 500 ? error.status : 500) || 500;
  if (statusCode >= 500) {
    console.error('Request failed:', error.message);
  }

  res.status(statusCode).json({
    success: false,
    message:
      statusCode < 500 || error.expose
        ? error.message
        : 'Internal server error.',
  });
});

module.exports = app;