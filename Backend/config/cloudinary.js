const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { v2: cloudinary } = require('cloudinary');

dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.post(
  '/property-image',
  upload.single('image'),
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Image file is required.'
        });
      }

      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder: 'acchasolution/properties',
            resource_type: 'image'
          },

          (error, result) => {

            if (error) {

              console.error(
                'Cloudinary upload error:',
                error
              );

              return res.status(500).json({
                success: false,
                message: 'Image upload failed.',
                error: error.message
              });
            }

            return res.status(200).json({
              success: true,
              message: 'Image uploaded successfully.',
              url: result.secure_url,
              public_id: result.public_id
            });
          }
        );

      uploadStream.end(req.file.buffer);

    } catch (error) {

      console.error(
        'PROPERTY IMAGE UPLOAD ERROR:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Unable to upload image.',
        error: error.message
      });
    }
  }
);

module.exports = router;