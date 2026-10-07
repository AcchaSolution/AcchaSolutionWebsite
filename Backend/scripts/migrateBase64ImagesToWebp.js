const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { v2: cloudinary } = require('cloudinary');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL;

if (!mongoUri) {
  console.error('❌ MongoDB connection string not found in .env');
  process.exit(1);
}

function isBase64Image(value) {
  return (
    typeof value === 'string' &&
    value.startsWith('data:image/')
  );
}

function uploadBase64ToCloudinary(dataUri) {
  return new Promise((resolve, reject) => {

    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: 'acchasolution/properties',
          resource_type: 'image',
          format: 'webp',
          quality: 'auto'
        },
        (error, result) => {

          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      );

    uploadStream.end(
      Buffer.from(
        dataUri.split(',')[1],
        'base64'
      )
    );
  });
}

async function migrate() {

  try {

    console.log('🔌 Connecting MongoDB...');

    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB connected');

    const db = mongoose.connection.db;

    const collection =
      db.collection('properties');

    const properties =
      await collection.find({}).toArray();

    console.log(
      '🏠 TOTAL PROPERTIES:',
      properties.length
    );

    let propertyCount = 0;
    let imageCount = 0;

    for (const property of properties) {

      let changed = false;

      // =====================================================
      // GALLERY
      // =====================================================

      if (
        Array.isArray(property.gallery)
      ) {

        for (
          let i = 0;
          i < property.gallery.length;
          i++
        ) {

          const galleryItem =
            property.gallery[i];

          const oldUrl =
            galleryItem?.url;

          if (!isBase64Image(oldUrl)) {
            continue;
          }

          console.log(
            `🖼️ Converting gallery image: ${
              property.name || property._id
            }`
          );

          try {

            const result =
              await uploadBase64ToCloudinary(
                oldUrl
              );

            property.gallery[i].url =
              result.secure_url;

            changed = true;
            imageCount++;

            console.log(
              '   ✅ WebP:',
              result.secure_url
            );

          } catch (error) {

            console.error(
              '   ❌ Image upload failed:',
              error.message
            );

          }
        }
      }

      // =====================================================
      // LEGACY IMAGE FIELD
      // =====================================================

      if (
        isBase64Image(property.image)
      ) {

        console.log(
          `🖼️ Converting legacy image: ${
            property.name || property._id
          }`
        );

        try {

          const result =
            await uploadBase64ToCloudinary(
              property.image
            );

          property.image =
            result.secure_url;

          changed = true;
          imageCount++;

          console.log(
            '   ✅ WebP:',
            result.secure_url
          );

        } catch (error) {

          console.error(
            '   ❌ Legacy image upload failed:',
            error.message
          );

        }
      }

      // =====================================================
      // LEGACY IMAGES ARRAY
      // =====================================================

      if (
        Array.isArray(property.images)
      ) {

        for (
          let i = 0;
          i < property.images.length;
          i++
        ) {

          const oldUrl =
            property.images[i];

          if (!isBase64Image(oldUrl)) {
            continue;
          }

          console.log(
            `🖼️ Converting images[]: ${
              property.name || property._id
            }`
          );

          try {

            const result =
              await uploadBase64ToCloudinary(
                oldUrl
              );

            property.images[i] =
              result.secure_url;

            changed = true;
            imageCount++;

            console.log(
              '   ✅ WebP:',
              result.secure_url
            );

          } catch (error) {

            console.error(
              '   ❌ Image upload failed:',
              error.message
            );

          }
        }
      }

      // =====================================================
      // SAVE PROPERTY
      // =====================================================

      if (changed) {

        await collection.updateOne(
          {
            _id: property._id
          },
          {
            $set: {
              ...(property.gallery
                ? {
                    gallery:
                      property.gallery
                  }
                : {}),

              ...(property.image
                ? {
                    image:
                      property.image
                  }
                : {}),

              ...(property.images
                ? {
                    images:
                      property.images
                  }
                : {})
            }
          }
        );

        propertyCount++;

        console.log(
          `💾 SAVED: ${
            property.name || property._id
          }`
        );
      }
    }

    console.log('');
    console.log('======================================');
    console.log('🎉 MIGRATION COMPLETE');
    console.log('======================================');
    console.log(
      '🏠 Properties updated:',
      propertyCount
    );
    console.log(
      '🖼️ Images converted:',
      imageCount
    );
    console.log('======================================');

  } catch (error) {

    console.error(
      '❌ MIGRATION ERROR:',
      error
    );

  } finally {

    await mongoose.disconnect();

    console.log(
      '🔌 MongoDB disconnected'
    );
  }
}

migrate();