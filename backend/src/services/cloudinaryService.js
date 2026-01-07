import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';

// Configure Cloudinary
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
} else {
  console.warn('⚠️  Cloudinary credentials not configured. File uploads will fail.');
  console.warn('   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
}

/**
 * Upload image to Cloudinary
 * @param {Buffer|string} file - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadImage = async (file, options = {}) => {
  try {
    // Check if Cloudinary is configured
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
    }

    const {
      folder = 'lms',
      transformation = {},
      publicId = null,
      resourceType = 'image',
    } = options;

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      ...transformation,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    if (Buffer.isBuffer(file)) {
      // Upload from buffer
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file);
      });
    } else {
      // Upload from file path
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return result;
    }
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Upload video to Cloudinary
 * @param {Buffer|string} file - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadVideo = async (file, options = {}) => {
  try {
    // Check if Cloudinary is configured
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
    }

    const {
      folder = 'lms/videos',
      transformation = {},
      publicId = null,
    } = options;

    const uploadOptions = {
      folder,
      resource_type: 'video',
      ...transformation,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    if (Buffer.isBuffer(file)) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file);
      });
    } else {
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return result;
    }
  } catch (error) {
    throw new Error(`Video upload failed: ${error.message}`);
  }
};

/**
 * Upload document/PDF to Cloudinary
 * @param {Buffer|string} file - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadDocument = async (file, options = {}) => {
  try {
    // Check if Cloudinary is configured
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
    }

    const {
      folder = 'lms/documents',
      publicId = null,
    } = options;

    const uploadOptions = {
      folder,
      resource_type: 'raw',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    if (Buffer.isBuffer(file)) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file);
      });
    } else {
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return result;
    }
  } catch (error) {
    throw new Error(`Document upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} Delete result
 */
export const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error(`File deletion failed: ${error.message}`);
  }
};

/**
 * Generate image URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} Transformed image URL
 */
export const getImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    ...transformations,
  });
};

/**
 * Generate video URL with transformations
 * @param {string} publicId - Public ID of the video
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} Transformed video URL
 */
export const getVideoUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    ...transformations,
  });
};

export default {
  uploadImage,
  uploadVideo,
  uploadDocument,
  deleteFile,
  getImageUrl,
  getVideoUrl,
};


