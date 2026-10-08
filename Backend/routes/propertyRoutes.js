const express = require('express');

const Property =
  require('../models/property');

const adminAuth =
  require('../middleware/adminAuth');

const userAuth =
  require('../middleware/userAuth');

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


const propertyDataToSave = {
  ...propertyData
};

// New submission ko hamesha current server time mile
delete propertyDataToSave.createdAt;
delete propertyDataToSave.updatedAt;

const property =
  await Property.create(
    propertyDataToSave
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



// 
// =====================================================
// GET PROPERTIES — PAGINATED + FILTERED
// GET /api/properties?page=1&limit=20
// =====================================================

router.get('/', async (req, res) => {

  console.log(
    'GET PAGINATED PROPERTIES API HIT'
  );

  try {

    const page =
      Math.max(
        parseInt(req.query.page, 10) || 1,
        1
      );

    const limit =
      Math.min(
        Math.max(
          parseInt(req.query.limit, 10) || 20,
          1
        ),
        50
      );

    const skip =
      (page - 1) * limit;


    // =================================================
    // BUILD FILTERS WITHOUT $OR OVERWRITE
    // =================================================

    const filters = [];


    // =================================================
    // SALE / RENT / COMMERCIAL
    // =================================================

    const requestedType =
      String(req.query.type || '')
        .trim()
        .toLowerCase();

    if (requestedType) {

      if (requestedType === 'rent') {

        filters.push({
          type: {
            $regex: /^rent$|^rental$/i
          }
        });

      }

      else if (requestedType === 'sale') {

        filters.push({
          type: {
            $regex: /^sale$|^sell$|^buy$/i
          }
        });

      }

      else if (requestedType === 'commercial') {

        filters.push({
          $or: [
            {
              type: {
                $regex: /commercial/i
              }
            },
            {
              category: {
                $regex: /commercial/i
              }
            },
            {
              propertyType: {
                $regex: /commercial/i
              }
            },
            {
              selectedCategories: {
                $regex: /commercial/i
              }
            }
          ]
        });

      }

      else {

        filters.push({
          type: {
            $regex:
              `^${requestedType}$`,
            $options: 'i'
          }
        });

      }

    }


    // =================================================
    // STATUS / READY TO MOVE
    // =================================================

    const requestedStatus =
      String(req.query.status || '')
        .trim()
        .toLowerCase();

    if (requestedStatus) {

      if (
        requestedStatus === 'ready' ||
        requestedStatus === 'ready to move'
      ) {

        filters.push({
          $or: [
            {
              possession: {
                $regex: /ready\s*to\s*move|^ready$/i
              }
            },
            {
              status: {
                $regex: /ready\s*to\s*move|^ready$/i
              }
            },
            {
              propertyStatus: {
                $regex: /ready\s*to\s*move|^ready$/i
              }
            }
          ]
        });

      }

      else {

        filters.push({
          $or: [
            {
              status: {
                $regex: requestedStatus,
                $options: 'i'
              }
            },
            {
              propertyStatus: {
                $regex: requestedStatus,
                $options: 'i'
              }
            },
            {
              possession: {
                $regex: requestedStatus,
                $options: 'i'
              }
            }
          ]
        });

      }

    }


    // =================================================
    // NEW PROJECT
    // =================================================

    const newProject =
      String(req.query.newProject || '')
        .trim()
        .toLowerCase();

    if (newProject === 'true') {

      filters.push({
        $or: [
          {
            isBuilderProject: true
          },
          {
            newBuilderProject: true
          },
          {
            isNewProject: true
          },
          {
            builderProject: true
          },
          {
            builderName: {
              $exists: true,
              $nin: ['', null]
            }
          },
          {
            builder: {
              $exists: true,
              $nin: ['', null]
            }
          }
        ]
      });

    }


    // =================================================
    // LOCATION / CITY
    // =================================================

    const location =
      String(
        req.query.location ||
        req.query.city ||
        ''
      )
        .trim();

    if (location) {

      filters.push({
        $or: [
          {
            location: {
              $regex: location,
              $options: 'i'
            }
          },
          {
            city: {
              $regex: location,
              $options: 'i'
            }
          },
          {
            locality: {
              $regex: location,
              $options: 'i'
            }
          },
          {
            address: {
              $regex: location,
              $options: 'i'
            }
          }
        ]
      });

    }


    // =================================================
    // BHK
    // =================================================

    const requestedBhk =
      String(req.query.bhk || '')
        .trim();

    if (requestedBhk) {

      const bhkNumber =
        requestedBhk.match(/(\d+)/);

      if (bhkNumber) {

        if (
          requestedBhk
            .toLowerCase()
            .includes('4+')
        ) {

          filters.push({
            bhk: {
              $regex: /^[4-9]\s*BHK$/i
            }
          });

        }

        else {

          filters.push({
            bhk: {
              $regex:
                `^${bhkNumber[1]}\\s*BHK$`,
              $options: 'i'
            }
          });

        }

      }

    }

// =================================================
// PROPERTY CATEGORY / TYPE
// Flat / Villa / House / Plot
// =================================================

const requestedPropertyType =
  String(req.query.propertyType || '')
    .trim()
    .toLowerCase();

if (requestedPropertyType) {

  const propertyTypeMap = {

    flat: [
      'apartment',
      'flat'
    ],

    villa: [
      'villa'
    ],

    house: [
      'house',
      'villa'
    ],

    plot: [
      'plot'
    ]

  };

  const categoryValues =
    propertyTypeMap[requestedPropertyType] ||
    [requestedPropertyType];

  filters.push({

    $or: categoryValues.map(
      (category) => ({

        selectedCategories: {
          $regex: category,
          $options: 'i'
        }

      })
    )

  });

}



    // =================================================
    // RENTAL BUDGET
    // =================================================

    const budget =
      String(req.query.budget || '')
        .trim()
        .toLowerCase();

    if (budget) {

      if (budget === 'under-20000') {

        filters.push({
          price: {
            $lt: 20000
          }
        });

      }

      else if (budget === '20000-50000') {

        filters.push({
          price: {
            $gte: 20000,
            $lte: 50000
          }
        });

      }

      else if (budget === 'above-50000') {

        filters.push({
          price: {
            $gt: 50000
          }
        });

      }

    }


    // =================================================
    // FINAL QUERY
    // =================================================

    const query =
      filters.length > 0
        ? { $and: filters }
        : {};


    console.log(
      '🔎 PROPERTY FILTER QUERY:',
      JSON.stringify(query)
    );


    // =================================================
    // FETCH
    // =================================================

    const [
      properties,
      total
    ] = await Promise.all([

      Property.find(query)
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Property.countDocuments(query)

    ]);


    const totalPages =
      Math.ceil(total / limit);


    return res.status(200).json({

      success: true,

      properties,

      pagination: {

        page,
        limit,
        total,
        totalPages,

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1

      }

    });

  }

  catch (error) {

    console.error(
      'GET PAGINATED PROPERTIES ERROR:',
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
    // MONGODB OBJECT ID
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
// UPDATE PROPERTY STATUS
// PATCH /api/properties/:id/status
// ADMIN ONLY
// =====================================================

router.patch(
  '/:id/status',
  adminAuth,
  async (req, res) => {

    try {

      const { status } =
        req.body;


      const allowedStatuses = [

        'AVAILABLE',
        'RENTED_OUT',
        'SOLD_OUT'

      ];


      if (
        !allowedStatuses.includes(status)
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid property status. Allowed values: AVAILABLE, RENTED_OUT, SOLD_OUT.'

        });

      }


      const property =
        await Property.findOne({

          $or: [

            {
              id:
                req.params.id
            },

            {
              uniqueId:
                req.params.id
            },

            ...(mongoose.Types.ObjectId.isValid(
              req.params.id
            )
              ? [
                  {
                    _id:
                      req.params.id
                  }
                ]
              : [])

          ]

        });


      if (!property) {

        return res.status(404).json({

          success: false,

          message:
            'Property not found.'

        });

      }


      property.status =
        status;


      property.isRentedOut =
        status === 'RENTED_OUT';


      await property.save();


      console.log(
        '✅ STATUS SAVED IN DATABASE:',
        {
          id:
            property._id,

          name:
            property.name,

          status:
            property.status,

          isRentedOut:
            property.isRentedOut
        }
      );


      return res.status(200).json({

        success: true,

        message:
          `Property status updated to ${status}.`,

        property

      });

    }

    catch (error) {

      console.error(
        'UPDATE PROPERTY STATUS ERROR:',
        error
      );


      return res.status(500).json({

        success: false,

        message:
          'Failed to update property status.'

      });

    }

  }
);


// =====================================================
// UPDATE RENTED OUT STATUS
// PATCH /api/properties/:id/rented-out
// ADMIN ONLY
// =====================================================

router.patch(
  '/:id/rented-out',
  adminAuth,
  async (req, res) => {

    console.log(
      '🏠 RENTED OUT STATUS API HIT:',
      req.params.id,
      req.body
    );

    try {

      const requestedId =
        String(
          req.params.id || ''
        ).trim();


      if (!requestedId) {

        return res.status(400).json({

          success: false,

          message:
            'Property ID is required.'

        });

      }


      if (
        typeof req.body?.isRentedOut !== 'boolean'
      ) {

        return res.status(400).json({

          success: false,

          message:
            'isRentedOut must be true or false.'

        });

      }


      const conditions = [

        {
          id:
            requestedId
        },

        {
          uniqueId:
            requestedId
        }

      ];


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

        return res.status(404).json({

          success: false,

          message:
            'Property not found.'

        });

      }


      property.isRentedOut =
        req.body.isRentedOut;


      await property.save();


      console.log(
        '✅ RENTED OUT STATUS UPDATED:',
        {
          id:
            property.id,

          uniqueId:
            property.uniqueId,

          isRentedOut:
            property.isRentedOut

        }
      );


      return res.status(200).json({

        success: true,

        message:
          property.isRentedOut
            ? 'Property marked as Rented Out.'
            : 'Property restored to Available.',

        property

      });

    }

    catch (error) {

      console.error(
        '❌ RENTED OUT STATUS ERROR:',
        error
      );


      return res.status(500).json({

        success: false,

        message:
          'Failed to update Rented Out status.',

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

router.put(
  '/:id',
  adminAuth,
  async (req, res) => {

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


      console.log(
        'UPDATED PROPERTY TIMESTAMPS:',
        {
          createdAt:
            property.createdAt,

          updatedAt:
            property.updatedAt
        }
      );


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

  }
);


// =====================================================
// INCREMENT PROPERTY VIEW COUNT
// POST /api/properties/:id/view
// Public route
// =====================================================

router.post(
  '/:id/view',
  async (req, res) => {

    console.log(
      '👁️ PROPERTY VIEW API HIT:',
      req.params.id
    );


    try {

      const requestedId =
        String(
          req.params.id || ''
        ).trim();


      if (!requestedId) {

        return res.status(400).json({

          success: false,

          message:
            'Property ID is required.'

        });

      }


      const conditions = [

        {
          id:
            requestedId
        },

        {
          uniqueId:
            requestedId
        }

      ];


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
        await Property.findOneAndUpdate(

          {
            $or:
              conditions
          },

          {
            $inc: {
              viewCount:
                1
            }
          },

          {
            new: true
          }

        );


      if (!property) {

        return res.status(404).json({

          success: false,

          message:
            'Property not found.'

        });

      }


      return res.status(200).json({

        success: true,

        viewCount:
          property.viewCount

      });

    }

    catch (error) {

      console.error(
        'PROPERTY VIEW COUNT ERROR:',
        error
      );


      return res.status(500).json({

        success: false,

        message:
          'Unable to update property views.'

      });

    }

  }
);


// =====================================================
// UPDATE OWN PROPERTY
// PUT /api/properties/my-property/:id
// =====================================================

router.put(
  '/my-property/:id',
  userAuth,
  async (req, res) => {

    console.log(
      'USER PROPERTY UPDATE API HIT:',
      req.params.id
    );


    try {

      const requestedId =
        String(
          req.params.id || ''
        ).trim();


      const userEmail =
        String(
          req.user?.email || ''
        )
        .trim()
        .toLowerCase();


      if (!userEmail) {

        return res.status(401).json({

          success: false,

          message:
            'User email not found in token.'

        });

      }


      const conditions = [

        {
          id:
            requestedId
        },

        {
          uniqueId:
            requestedId
        }

      ];


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

        return res.status(404).json({

          success: false,

          message:
            'Property not found.'

        });

      }


      const postedByEmail =
        String(
          property.postedByEmail || ''
        )
        .trim()
        .toLowerCase();


      if (
        postedByEmail !== userEmail
      ) {

        return res.status(403).json({

          success: false,

          message:
            'You can only edit your own property.'

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
        'USER PROPERTY UPDATE ERROR:',
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

  }
);


// =====================================================
// DELETE PROPERTY
// DELETE /api/properties/:id
// =====================================================

router.delete(
  '/:id',
  adminAuth,
  async (req, res) => {

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

  }
);


// =====================================================
// =====================================================
// FAST HOME PROPERTIES
// GET /api/properties/home
//
// NO 15-DAY CONDITION
//
// CURATED = latest 8 properties
// FEATURED = next 8 properties
// =====================================================

router.get(
  '/home',
  async (req, res) => {

    console.log(
      '🏠 FAST HOME PROPERTIES API HIT'
    );

    try {

      const homeStartTime = Date.now();
      // =================================================
      // GET LATEST 16 PROPERTIES ONLY
      // =================================================

const properties =
  await Property.find({})
    .select({
      _id: 1,
      id: 1,
      uniqueId: 1,
      name: 1,
      permalink: 1,
      type: 1,
      status: 1,
      isRentedOut: 1,
      is_featured: 1,
      priority: 1,
      price: 1,
      area: 1,
      bhk: 1,
      bathrooms: 1,
      furnishing: 1,
      facing: 1,
      location: 1,
      address: 1,
      city: 1,
      locality: 1,
      subLocality: 1,
      createdAt: 1,
      updatedAt: 1,
viewCount: 1,

      // ONLY FIRST IMAGE FOR HOME CARD
      gallery: {
        $slice: 1
      }
    })
    .sort({
      createdAt: -1
    })
    .limit(16)
    .lean();

    
      // =================================================
      // NORMALIZE IMAGE
      // =================================================

      const normalized =
        properties.map(
          (property) => {

            let cardImage = '';


            if (
              Array.isArray(
                property?.gallery
              )
            ) {

              const mainImage =
                property.gallery.find(
                  (img) =>
                    img?.main === true &&
                    img?.url
                );

              cardImage =
                mainImage?.url ||
                property.gallery?.[0]?.url ||
                '';

            }


            if (!cardImage) {

              cardImage =
                property?.image ||
                '';

            }


            return {

              ...property,

              isRentedOut:

                property?.isRentedOut === true ||

                String(
                  property?.status || ''
                )
                .trim()
                .toUpperCase() ===
                  'RENTED_OUT',

              image:
                cardImage || null,

              gallery:

                cardImage
                  ? [
                      {
                        url:
                          cardImage,
                        main:
                          true
                      }
                    ]
                  : [],

              images:

                cardImage
                  ? [
                      cardImage
                    ]
                  : []

            };

          }
        );


      // =================================================
      // CURATED
      //
      // Latest 8 properties
      // =================================================

      const curated =
        normalized.slice(
          0,
          8
        );


      // =================================================
      // FEATURED
      //
      // Next 8 properties
      // =================================================

      const featured =
        normalized.slice(
          8,
          16
        );


      console.log(
        '🏠 CURATED COUNT:',
        curated.length
      );

      console.log(
        '⭐ FEATURED COUNT:',
        featured.length
      );


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({

        success: true,

        curated,

        featured,

        properties:
          curated

      });

    }

    catch (error) {

      console.error(
        '❌ FAST HOME PROPERTIES ERROR:',
        error
      );

      return res.status(500).json({

        success: false,

        message:
          'Failed to fetch home properties.'

      });

    }

  }
);

module.exports = router;