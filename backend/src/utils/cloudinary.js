import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Uploads a file buffer to Cloudinary using a stream.
 * @param {Buffer} buffer - The file buffer from multer.
 * @param {String} folder - Optional folder name in Cloudinary.
 * @returns {Promise<Object>} The Cloudinary upload result.
 */
export const uploadStream = (buffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(upload);
  });
};
