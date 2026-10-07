const mongoose = require('mongoose');
require('dotenv').config();

const Property =
  require('../models/property');

async function backfillCreatedAt() {
  try {
    await mongoose.connect(
  process.env.MONGO_URI
);

    console.log(
      'MongoDB Connected for createdAt migration'
    );

    const properties =
      await Property.find({
        $or: [
          { createdAt: { $exists: false } },
          { createdAt: null }
        ]
      }).select('_id name createdAt');

    console.log(
      'Properties needing createdAt:',
      properties.length
    );

    let updated = 0;

    for (const property of properties) {

      if (
        !property._id ||
        !property._id.getTimestamp
      ) {
        console.log(
          '⚠️ Cannot determine date for:',
          property.name
        );

        continue;
      }

      const createdAt =
        property._id.getTimestamp();

      await Property.updateOne(
        { _id: property._id },
        {
          $set: {
            createdAt
          }
        }
      );

      updated++;

      console.log(
        `✅ ${property.name} → ${createdAt.toISOString()}`
      );
    }

    console.log(
      '================================='
    );

    console.log(
      '🎉 createdAt migration complete'
    );

    console.log(
      'Properties updated:',
      updated
    );

    console.log(
      '================================='
    );

  } catch (error) {

    console.error(
      '❌ createdAt migration failed:',
      error
    );

  } finally {

    await mongoose.disconnect();

    console.log(
      'MongoDB disconnected'
    );
  }
}

backfillCreatedAt();