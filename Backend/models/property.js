const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    uniqueId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    permalink: {
      type: String,
      required: true,
      index: true
    },

    type: {
      type: String,
      default: 'Rent'
    },

    description: {
      type: String,
      default: ''
    },

    status: {
      type: String,
      default: 'Renting'
    },

    is_featured: {
      type: Boolean,
      default: false
    },

    priority: {
      type: Number,
      default: 10
    },

    price: {
      type: mongoose.Schema.Types.Mixed,
      default: 0
    },

    area: {
      type: String,
      default: ''
    },

    bhk: {
      type: String,
      default: '1 BHK'
    },

    totalFloors: {
      type: mongoose.Schema.Types.Mixed,
      default: ''
    },

    propertyFloor: {
      type: mongoose.Schema.Types.Mixed,
      default: ''
    },

    furnishing: {
      type: String,
      default: 'Unfurnished'
    },

    facing: {
      type: String,
      default: 'East Facing'
    },

    bathrooms: {
      type: mongoose.Schema.Types.Mixed,
      default: ''
    },

    possession: {
      type: String,
      default: 'Ready to Move'
    },

    // =========================
    // LOCATION
    // =========================

    location: {
      type: String,
      default: ''
    },

    address: {
      type: String,
      default: ''
    },

    city: {
      type: String,
      default: 'Bengaluru'
    },

    locality: {
      type: String,
      default: ''
    },

    subLocality: {
      type: String,
      default: ''
    },

    landmark: {
      type: String,
      default: ''
    },

    state: {
      type: String,
      default: 'Karnataka'
    },

    pincode: {
      type: String,
      default: ''
    },

    // =========================
    // COORDINATES
    // =========================

    latitude: {
      type: mongoose.Schema.Types.Mixed,
      default: 12.9698
    },

    longitude: {
      type: mongoose.Schema.Types.Mixed,
      default: 77.7500
    },

    // =========================
    // RATING / ANALYSIS
    // =========================

    rating: {
      type: mongoose.Schema.Types.Mixed,
      default: ''
    },

    priceAnalysis: {
      type: Number,
      default: 20
    },

    // =========================
    // AGENT
    // =========================

    postedById: {
      type: String,
      default: ''
    },

    postedByEmail: {
      type: String,
      default: ''
    },

    postedByName: {
      type: String,
      default: ''
    },

    // =========================
    // AMENITIES
    // =========================

    selectedAmenities: {
      type: [String],
      default: []
    },

    // =========================
    // CATEGORIES
    // =========================

    selectedCategories: {
      type: [String],
      default: []
    },

    // =========================
    // GALLERY
    // =========================

    gallery: {
      type: [
        {
          url: {
            type: String,
            default: ''
          },

          main: {
            type: Boolean,
            default: false
          }
        }
      ],

      default: []
    }
  },

  {
    timestamps: true,

    // Rich HTML description ko preserve karne ke liye
    minimize: false
  }
);

module.exports =
  mongoose.models.Property ||
  mongoose.model(
    'Property',
    propertySchema
  );