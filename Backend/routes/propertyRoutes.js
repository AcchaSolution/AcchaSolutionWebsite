const express = require('express');

const Property =
  require('../models/property');

const mongoose =
  require('mongoose');

const router =
  express.Router();

console.log(
  'PROPERTY ROUTES LOADED'
);


// =====================================================
// CREATE PROPERTY
// POST /api/properties
// =====================================================

router.post('/', async (req, res) => {

  console.log(
    'CREATE PROPERTY API HIT'
  );

  try {

    const propertyData =
      req.body;


    if (
      !propertyData.name ||
      !String(propertyData.name).trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Property name is required.'

      });

    }


    if (
      !propertyData.uniqueId
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Property uniqueId is required.'

      });

    }


    const duplicateConditions = [
      {
        uniqueId:
          propertyData.uniqueId
      }
    ];


    if (
      propertyData.id
    ) {

      duplicateConditions.push({
        id:
          propertyData.id
      });

    }


    const existingProperty =
      await Property.findOne({
        $or:
          duplicateConditions
      });


    if (existingProperty) {

      return res.status(409).json({

        success: false,

        message:
          'Property with this ID already exists.'

      });

    }


    const property =
      await Property.create(
        propertyData
      );


    return res.status(201).json({

      success: true,

      message:
        'Property saved successfully.',

      property

    });

  }

  catch (error) {

    console.error(
      'CREATE PROPERTY ERROR:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Failed to save property.',

      error:
        error.message

    });

  }

});


// =====================================================
// GET ALL PROPERTIES
// GET /api/properties
// =====================================================

router.get('/', async (req, res) => {

  console.log(
    'GET ALL PROPERTIES API HIT'
  );

  try {

    const properties =
      await Property.find({})
        .sort({
          createdAt: -1
        });


    return res.status(200).json({

      success: true,

      properties

    });

  }

  catch (error) {

    console.error(
      'GET PROPERTIES ERROR:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Failed to fetch properties.'

    });

  }

});


// =====================================================
// GET PROPERTY BY ID / UNIQUE ID / MONGO ID
// GET /api/properties/id/:id
// =====================================================

router.get('/id/:id', async (req, res) => {

  const requestedId =
    String(
      req.params.id || ''
    ).trim();


  console.log(
    '🔎 GET PROPERTY BY ID:',
    requestedId
  );


  try {

    const conditions = [];


    // ---------------------------------------------------
    // CUSTOM ID
    // ---------------------------------------------------

    conditions.push({
      id:
        requestedId
    });


    // ---------------------------------------------------
    // UNIQUE ID
    // ---------------------------------------------------

    conditions.push({
      uniqueId:
        requestedId
    });


    // ---------------------------------------------------
    // MONGODB _id
    // Only if valid ObjectId
    // ---------------------------------------------------

    if (
      mongoose.Types.ObjectId.isValid(
        requestedId
      )
    ) {

      conditions.push({
        _id:
          requestedId
      });

    }


    const property =
      await Property.findOne({
        $or:
          conditions
      });


    if (!property) {

      console.log(
        '❌ PROPERTY NOT FOUND:',
        requestedId
      );


      return res.status(404).json({

        success: false,

        message:
          'Property not found.',

        requestedId

      });

    }


    console.log(
      '✅ PROPERTY FOUND:',
      property._id
    );


    return res.status(200).json({

      success: true,

      property

    });

  }

  catch (error) {

    console.error(
      '❌ GET PROPERTY BY ID ERROR:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Failed to fetch property.',

      error:
        error.message

    });

  }

});


// =====================================================
// GET PROPERTY BY PERMALINK
// GET /api/properties/permalink/:slug
// =====================================================

router.get(
  '/permalink/:slug',
  async (req, res) => {

    const requestedSlug =
      decodeURIComponent(
        req.params.slug || ''
      )
      .trim()
      .toLowerCase();


    console.log(
      '🔗 GET PROPERTY BY PERMALINK:',
      requestedSlug
    );


    try {

      const properties =
        await Property.find({});


      const property =
        properties.find(
          item => {

            if (
              !item.permalink
            ) {

              return false;

            }


            let savedSlug = '';


            try {

              const raw =
                String(
                  item.permalink
                ).trim();


              // Full URL
              if (
                raw.startsWith('http://') ||
                raw.startsWith('https://')
              ) {

                const url =
                  new URL(raw);

                savedSlug =
                  url.pathname;

              }

              else {

                savedSlug =
                  raw;

              }

            }

            catch {

              savedSlug =
                String(
                  item.permalink
                );

            }


            savedSlug =
              savedSlug

                .split('?')[0]

                .split('#')[0]

                .replace(
                  /^\/+/,
                  ''
                )

                .replace(
                  /^properties\//i,
                  ''
                )

                .replace(
                  /\/+$/,
                  ''
                )

                .trim()
                .toLowerCase();


            return (
              savedSlug ===
              requestedSlug
            );

          }
        );


      if (!property) {

        console.log(
          '❌ PERMALINK NOT FOUND:',
          requestedSlug
        );


        return res.status(404).json({

          success: false,

          message:
            'Property not found.',

          requestedSlug

        });

      }


      console.log(
        '✅ PERMALINK PROPERTY FOUND:',
        property._id
      );


      return res.status(200).json({

        success: true,

        property

      });

    }

    catch (error) {

      console.error(
        '❌ GET PROPERTY BY PERMALINK ERROR:',
        error
      );


      return res.status(500).json({

        success: false,

        message:
          'Failed to find property.',

        error:
          error.message

      });

    }

  }
);


// =====================================================
// UPDATE PROPERTY
// PUT /api/properties/:id
// =====================================================

router.put('/:id', async (req, res) => {

  console.log(
    'UPDATE PROPERTY API HIT:',
    req.params.id
  );


  try {

    const conditions = [

      {
        id:
          req.params.id
      },

      {
        uniqueId:
          req.params.id
      }

    ];


    if (
      mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {

      conditions.push({

        _id:
          req.params.id

      });

    }


    const property =
      await Property.findOne({
        $or:
          conditions
      });


    if (!property) {

      return res.status(404).json({

        success: false,

        message:
          'Property not found.'

      });

    }


    Object.assign(
      property,
      req.body
    );


    await property.save();


    return res.status(200).json({

      success: true,

      message:
        'Property updated successfully.',

      property

    });

  }

  catch (error) {

    console.error(
      'UPDATE PROPERTY ERROR:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Failed to update property.',

      error:
        error.message

    });

  }

});


// =====================================================
// DELETE PROPERTY
// DELETE /api/properties/:id
// =====================================================

router.delete('/:id', async (req, res) => {

  console.log(
    'DELETE PROPERTY API HIT:',
    req.params.id
  );


  try {

    const conditions = [

      {
        id:
          req.params.id
      },

      {
        uniqueId:
          req.params.id
      }

    ];


    if (
      mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {

      conditions.push({

        _id:
          req.params.id

      });

    }


    const deleted =
      await Property.findOneAndDelete({
        $or:
          conditions
      });


    if (!deleted) {

      return res.status(404).json({

        success: false,

        message:
          'Property not found.'

      });

    }


    return res.status(200).json({

      success: true,

      message:
        'Property deleted successfully.'

    });

  }

  catch (error) {

    console.error(
      'DELETE PROPERTY ERROR:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Failed to delete property.'

    });

  }

});


module.exports = router;