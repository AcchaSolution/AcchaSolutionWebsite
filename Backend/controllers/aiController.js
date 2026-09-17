const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const mongoose = require('mongoose');

// Dynamic safe unwrap container block for cross-collection queries
let Property;

try {
  Property = mongoose.model('Property');
} catch (e) {
  const Schema = mongoose.Schema;

  const PropertySchema = new Schema(
    {
      locality: String,
      bhk: String,
      price: Number,
      title: String,
      amenities: [String]
    },
    {
      strict: false
    }
  );

  Property =
    mongoose.models.Property ||
    mongoose.model('Property', PropertySchema);
}


// ============================================================
// 🟢 FEATURE 1: AI PROPERTY DESCRIPTION WRITER
// ============================================================

exports.generatePropertyDescription = async (req, res) => {
  try {

    // ============================================================
    // 📦 RECEIVE ACTUAL PROPERTY DATA FROM FRONTEND
    // ============================================================

    const {
      name,
      propertyName,
      title,

      // Possible property-type fields
      propertyType,
      category,

      // Purpose / listing fields
      listingType,
      type,
      status,

      price,
      budget,
      area,
      bhk,
      totalFloors,
      propertyFloor,
      furnishing,
      facing,
      bathrooms,
      possession,

      location,
      address,
      city,
      locality,
      subLocality,
      landmark,
      state,
      pincode,

      amenities
    } = req.body;


    // ============================================================
    // 🏠 PROPERTY NAME
    // ============================================================

    const finalPropertyName =
      propertyName ||
      name ||
      title ||
      'Property';


    // ============================================================
    // 🔄 PROPERTY PURPOSE
    // IMPORTANT:
    // Detect only RENT or SALE from supplied form values.
    // ============================================================

    const purposeSource = [
      listingType,
      type,
      status
    ]
      .filter(value =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      )
      .map(value =>
        String(value).trim().toLowerCase()
      )
      .join(' ');

    let propertyPurpose = '';

    if (
      /\brent\b/.test(purposeSource) ||
      /\brental\b/.test(purposeSource) ||
      /\brenting\b/.test(purposeSource) ||
      /\blease\b/.test(purposeSource) ||
      /\bleasing\b/.test(purposeSource)
    ) {
      propertyPurpose = 'RENT';

    } else if (
      /\bsale\b/.test(purposeSource) ||
      /\bsell\b/.test(purposeSource) ||
      /\bselling\b/.test(purposeSource)
    ) {
      propertyPurpose = 'SALE';

    } else {
      propertyPurpose = 'PROPERTY';
    }


    // ============================================================
    // 🏢 PROPERTY TYPE
    // Do not confuse Rent/Sale with Property Type.
    // ============================================================

    let finalPropertyType =
      propertyType ||
      category ||
      '';

    if (!finalPropertyType && type) {
      const typeText = String(type).trim();

      if (
        !/rent|rental|renting|sale|sell|selling|lease|leasing/i.test(
          typeText
        )
      ) {
        finalPropertyType = typeText;
      }
    }

    if (!finalPropertyType) {
      finalPropertyType = 'Not specified';
    }


    // ============================================================
    // 📍 ACTUAL LOCATION
    //
    // IMPORTANT:
    // Locality gets priority over generic/default location.
    // This prevents Whitefield from replacing Marathahalli etc.
    // ============================================================

    const primaryLocation =
      locality ||
      subLocality ||
      location ||
      city ||
      '';

    const locationParts = [
      primaryLocation,
      city,
      state,
      pincode
    ]
      .filter(value =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      )
      .map(value =>
        String(value).trim()
      )
      .filter(
        (value, index, array) =>
          array.indexOf(value) === index
      );

    const completeLocation =
      locationParts.length > 0
        ? locationParts.join(', ')
        : 'Location not specified';


    // ============================================================
    // 💰 PRICE
    // ============================================================

    const finalPrice =
      price !== undefined &&
      price !== null &&
      String(price).trim() !== ''
        ? price
        : budget || 'Not specified';


    // ============================================================
    // 🛋️ AMENITIES
    // ============================================================

    let finalAmenities = '';

    if (Array.isArray(amenities)) {

      finalAmenities = amenities
        .filter(value =>
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ''
        )
        .map(value =>
          String(value).trim()
        )
        .join(', ');

    } else if (
      amenities !== undefined &&
      amenities !== null &&
      String(amenities).trim() !== ''
    ) {

      finalAmenities =
        String(amenities).trim();
    }

    if (!finalAmenities) {
      finalAmenities = 'Not specified';
    }


    // ============================================================
    // 🤖 GEMINI MODEL
    // ============================================================

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',

      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 3000
      }
    });


    // ============================================================
    // 🧠 STRICT + FAST + FACTUAL SEO PROMPT
    // ============================================================

    const prompt = `
You are an expert Indian real estate SEO content writer.

Create a professional, unique and SEO-friendly property listing
using ONLY the factual information supplied below.

IMPORTANT FACTUAL RULES:

1. NEVER invent, assume, estimate or change any property information.

2. NEVER change RENT into SALE.

3. NEVER change SALE into RENT.

4. NEVER replace the actual locality or city with Whitefield or any
other location.

5. NEVER invent amenities.

6. NEVER invent schools, colleges, hospitals, malls, metro stations,
IT parks, highways, roads, distances or travel times.

7. NEVER invent builder, developer or project information.

8. NEVER invent possession dates.

9. NEVER invent prices, rental amounts or returns.

10. NEVER claim guaranteed investment returns, appreciation or rental
yield.

11. NEVER say "Vastu-friendly" unless Vastu information is explicitly provided.

12. NEVER infer sunlight, ventilation, privacy, views, peaceful
environment or similar benefits from floor, facing, area or direction.

13. NEVER compare this property with typical, average or standard
properties.

14. If information is missing, simply do not create a claim.

15. Do not mention the AI process.

16. Use natural SEO. Do not keyword-stuff.

17. The first line MUST contain the exact property name.

18. The second line MUST clearly identify the actual purpose as
FOR RENT or FOR SALE.

19. Use the supplied locality and city accurately.

20. The content must remain truthful even if that means using fewer
words.

============================================================
ACTUAL PROPERTY DATA
============================================================

Property Name:
${finalPropertyName}

Property Purpose:
${propertyPurpose}

Property Type:
${finalPropertyType}

Property Status:
${status || 'Not specified'}

Price:
${finalPrice}

Area:
${area || 'Not specified'}

BHK:
${bhk || 'Not specified'}

Total Floors:
${totalFloors || 'Not specified'}

Property Floor:
${propertyFloor || 'Not specified'}

Furnishing:
${furnishing || 'Not specified'}

Facing:
${facing || 'Not specified'}

Bathrooms:
${bathrooms || 'Not specified'}

Possession:
${possession || 'Not specified'}

Location:
${completeLocation}

Address:
${address || 'Not specified'}

City:
${city || 'Not specified'}

Locality:
${locality || 'Not specified'}

Sub Locality:
${subLocality || 'Not specified'}

Landmark:
${landmark || 'Not specified'}

State:
${state || 'Not specified'}

Pincode:
${pincode || 'Not specified'}

Amenities:
${finalAmenities}

============================================================
OUTPUT STRUCTURE
============================================================

Start exactly with:

${finalPropertyName}

Then immediately mention:

FOR RENT
or
FOR SALE

Then write the following sections:

1. Property Overview
2. Key Property Highlights
3. Space & Interior Experience
4. Amenities
5. Location & Connectivity
6. Rental / Buying Benefits
7. Why Consider This Property
8. Contact & Site Visit

Then add:

SEO Title:
Keep under 60 characters.

Meta Description:
Keep under 160 characters.

SEO Keywords:
Generate 10 relevant keywords using ONLY supplied property facts.

============================================================
WRITING STYLE
============================================================

- Professional real estate website language
- Natural English
- Human-readable
- SEO-friendly
- Persuasive but truthful
- Unique
- No repetitive paragraphs
- No fake claims
- No unsupported assumptions
- No keyword stuffing

============================================================
LENGTH
============================================================

Target approximately 800–1000 words if enough factual information
is available.

If the property data is limited, do NOT add fictional information
just to reach the word count.

Return ONLY the final property description.
`;


    // ============================================================
    // 🚀 GENERATE CONTENT + TIMING CHECK
    // ============================================================

    const aiStartTime = Date.now();

    console.log(
      '🤖 AI PROPERTY DESCRIPTION GENERATION STARTED'
    );

    const result =
      await model.generateContent(prompt);

    const aiResponseTime =
      Date.now() - aiStartTime;

    console.log(
      `⏱️ GEMINI RESPONSE TIME: ${aiResponseTime} ms`
    );

    const response =
      await result.response;

    const generatedText =
      response.text();

    console.log(
      `📝 GENERATED TEXT LENGTH: ${generatedText.length} characters`
    );


    // ============================================================
    // ✅ SEND TO FRONTEND
    // ============================================================

    return res.status(200).json({
      success: true,
      text: generatedText
    });


  } catch (error) {

    console.error(
      'Advanced Description AI Engine Failed:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'AI side se description generate nahi ho paya.'
    });
  }
};


// ============================================================
// 🟢 FEATURE 2: HOMEPAGE SMART AI SEARCH
// ============================================================

exports.smartSearchParser = async (req, res) => {
  try {

    const {
      query,
      tabContext,
      cityContext
    } = req.body;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',

      generationConfig: {
        responseMimeType: 'application/json'
      }
    });


    // ============================================================
    // 🧠 AI PROMPT
    // ============================================================

    const prompt = `
Analyze this real estate query and convert it into structured JSON
matching these keys strictly:

{
  "bhk": integer_or_null,
  "locality": "string_or_null",
  "maxBudget": number_or_null,
  "amenities": [],
  "purpose": "Rent_or_Sale_or_null"
}

Context:
Current Selected Tab Mode: ${tabContext}

City:
${cityContext}

User query string:
"${query}"

Respond with pure JSON wrapper only.
`;


    // ============================================================
    // 🤖 AI RESPONSE
    // ============================================================

    const result =
      await model.generateContent(prompt);

    const filtersParsed =
      JSON.parse(
        result.response.text()
      );


    // ============================================================
    // 🔎 DATABASE QUERY
    // ============================================================

    let dbQuery = {};


    // ============================================================
    // 📍 1. LOCALITY FILTER
    // ============================================================

    if (filtersParsed.locality) {

      dbQuery.$or = [

        {
          locality: {
            $regex: filtersParsed.locality,
            $options: 'i'
          }
        },

        {
          location: {
            $regex: filtersParsed.locality,
            $options: 'i'
          }
        },

        {
          address: {
            $regex: filtersParsed.locality,
            $options: 'i'
          }
        }

      ];

    } else if (
      query &&
      query.toLowerCase().includes('whitefield')
    ) {

      // Direct fallback for Whitefield
      dbQuery.$or = [

        {
          locality: {
            $regex: 'whitefield',
            $options: 'i'
          }
        },

        {
          location: {
            $regex: 'whitefield',
            $options: 'i'
          }
        },

        {
          address: {
            $regex: 'whitefield',
            $options: 'i'
          }
        }

      ];
    }


    // ============================================================
    // 🏢 2. BHK FILTER
    // ============================================================

    if (filtersParsed.bhk) {

      dbQuery.bhk = {
        $regex: String(filtersParsed.bhk),
        $options: 'i'
      };

    }


    // ============================================================
    // 🔄 3. PURPOSE / RENT / SALE
    // ============================================================

    const currentMode =
      tabContext || filtersParsed.purpose;

    if (currentMode) {

      dbQuery.$or = dbQuery.$or || [];

      dbQuery.$or.push({
        mode: {
          $regex: currentMode,
          $options: 'i'
        }
      });

      dbQuery.$or.push({
        purpose: {
          $regex: currentMode,
          $options: 'i'
        }
      });

      dbQuery.$or.push({
        type: {
          $regex: currentMode,
          $options: 'i'
        }
      });

    }


    // ============================================================
    // 🧾 DEBUG LOGS
    // ============================================================

    console.log("----------------------------------------");

    console.log(
      "AI Parsed Filters:",
      filtersParsed
    );

    console.log(
      "Executing Final Mongoose Query Parameters:",
      JSON.stringify(dbQuery)
    );

    console.log("----------------------------------------");


    // ============================================================
    // 🔎 DATABASE SEARCH
    // ============================================================

    const propertiesMatched =
      await Property.find(dbQuery);

    console.log(
      `Successfully found ${propertiesMatched.length} properties matching query.`
    );


    // ============================================================
    // 📦 RESPONSE
    // ============================================================

    return res.status(200).json({

      success: true,

      filtersApplied: filtersParsed,

      data: propertiesMatched

    });

  } catch (error) {

    console.error(
      "AI Parser Logic Crashed:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Server stream dropped formatting payload."

    });

  }
};