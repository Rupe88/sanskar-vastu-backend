import multer from 'multer';
import { uploadImage, uploadVideo, uploadDocument } from '../services/cloudinaryService.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|webm|ogg|mov/;
  const allowedDocTypes = /pdf|doc|docx|txt/;

  const mimetype = file.mimetype;

  if (
    allowedImageTypes.test(mimetype) ||
    allowedVideoTypes.test(mimetype) ||
    allowedDocTypes.test(mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter,
});

/**
 * Middleware for single file upload
 */
export const singleUpload = (fieldName) => upload.single(fieldName);

/**
 * Middleware for multiple file uploads
 */
export const multipleUpload = (fieldName, maxCount = 10) =>
  upload.array(fieldName, maxCount);

/**
 * Middleware for mixed file uploads
 */
export const fieldsUpload = (fields) => upload.fields(fields);

/**
 * Upload image to Cloudinary after multer processing
 */
export const processImageUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const folder = req.body.folder || 'lms/images';
    const transformation = req.body.transformation || {};

    const result = await uploadImage(req.file.buffer, {
      folder,
      transformation,
    });

    req.cloudinary = {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Upload video to Cloudinary after multer processing
 */
export const processVideoUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const folder = req.body.folder || 'lms/videos';

    const result = await uploadVideo(req.file.buffer, {
      folder,
    });

    req.cloudinary = {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Upload document to Cloudinary after multer processing
 */
export const processDocumentUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const folder = req.body.folder || 'lms/documents';

    const result = await uploadDocument(req.file.buffer, {
      folder,
    });

    req.cloudinary = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default upload;


