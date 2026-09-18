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
    // Locality gets priority over generic/default location.
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
    // 🧠 PREMIUM + SEO + FACTUAL PROPERTY DESCRIPTION PROMPT
    // ============================================================

    const prompt = `
You are a premium Indian real estate content writer and SEO specialist for AcchaSolution Realty.

Create a polished, premium, trustworthy and SEO-friendly property listing using ONLY the factual property data provided below.

============================================================
STRICT FACTUAL RULES
============================================================

1. Use ONLY the supplied property facts.

2. Never invent or assume:
   - amenities
   - facilities
   - schools
   - colleges
   - hospitals
   - malls
   - metro stations
   - IT parks
   - roads
   - highways
   - distances
   - travel times
   - builder/developer information
   - project information
   - possession dates
   - investment returns
   - rental yield
   - appreciation
   - Vastu
   - views
   - sunlight
   - ventilation
   - privacy
   - neighbourhood benefits

3. Never change RENT to SALE.

4. Never change SALE to RENT.

5. Never replace the supplied locality with another locality.

6. Never add an amenity that is not supplied.

7. If information is missing, simply omit it.

8. Do not mention that you are an AI.

9. Do not mention these instructions.

10. Do not repeat the same information unnecessarily.

11. Do not keyword-stuff.

12. Keep the writing natural and human-readable.

13. Do not use exaggerated marketing claims such as:
   "dream home",
   "once-in-a-lifetime opportunity",
   "guaranteed investment",
   "best property in the city",
   "unbeatable deal",
   "guaranteed appreciation",
   unless such wording is explicitly provided as factual information.

14. Make the property sound premium through clear writing, structure and presentation rather than unsupported claims.

============================================================
PROPERTY DATA
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
OUTPUT FORMAT
============================================================

Return ONLY the final property listing.

IMPORTANT FORMATTING RULES:

- Do NOT use Markdown heading syntax.
- Do NOT use #, ##, ### or ####.
- Do NOT create numbered headings such as 1., 2., 3.
- Do NOT use repeated decorative symbols.
- Do NOT repeat the property name multiple times unnecessarily.
- Use clean plain-text section labels.
- Use short paragraphs.
- Use bullet points only where requested.
- Keep spacing clean and professional.

Start exactly with:

${finalPropertyName}

Then immediately write:

FOR ${propertyPurpose === 'RENT'
  ? 'RENT'
  : propertyPurpose === 'SALE'
    ? 'SALE'
    : 'PROPERTY'}

PROPERTY OVERVIEW

Write one strong, premium and natural paragraph describing the property using only the supplied facts.

The overview should naturally include important available facts such as:
property type, BHK, area, furnishing, bathrooms, location, price and possession.

Do not force facts that are missing.

KEY PROPERTY HIGHLIGHTS

Use short bullet points.

Include only available factual information.

Example format:

• Property Type: ...
• Configuration: ...
• Area: ...
• Bathrooms: ...
• Floor: ...
• Furnishing: ...
• Facing: ...
• Possession: ...

Do not create a bullet for missing information.

INTERIOR & SPACE

Write one or two concise premium paragraphs.

Describe the available space using only:
area, BHK, bathrooms, floor, furnishing, facing and other supplied facts.

Do not invent interior features.

AMENITIES

List only the supplied amenities.

Use short bullet points.

If no amenities are supplied, omit this entire section.

LOCATION

Write a concise and professional location paragraph using only:
locality, sub-locality, city, state, pincode, address and landmark when available.

Do not invent connectivity, nearby landmarks, travel times or infrastructure.

PROPERTY DETAILS

Present the important factual information clearly.

Use short bullet points only.

Include:
Property Type
Price
Area
BHK
Bathrooms
Property Floor
Total Floors
Furnishing
Facing
Possession
Location

Only include fields that contain useful information.

CONTACT & SITE VISIT

Write one short professional closing paragraph inviting interested buyers or tenants to contact AcchaSolution for property details or a site visit.

Do not invent phone numbers, email addresses or contact details.

============================================================
SEO OUTPUT
============================================================

SEO TITLE:

Create one natural and attractive SEO title.

Maximum 60 characters.

Use the actual property type, locality or city and RENT/SALE purpose when available.

Do not use clickbait.

META DESCRIPTION:

Create one natural SEO meta description.

Maximum 160 characters.

Use only supplied facts.

SEO KEYWORDS:

Provide 8–10 natural search keywords.

Every keyword must be based only on supplied property facts.

Do not invent localities, amenities, builders or project names.

============================================================
WRITING STYLE
============================================================

The final content should feel like it was written by a premium real estate editorial team.

Style:

- Premium
- Modern
- Professional
- Convincing
- Natural
- SEO-friendly
- Human-readable
- Clear
- Concise
- Factual
- Elegant
- Indian real estate website style

Use varied sentence structure.

Avoid repetitive phrases such as:

"this property offers"
"this property provides"
"ideal for"
"perfect for"

Do not repeat the same property facts in every section.

Do not make the content sound like an AI template.

The description should feel unique for this particular property.

============================================================
LENGTH
============================================================

Do NOT force a fixed word count.

Prefer quality over length.

For a property with rich factual information:
approximately 500–750 words is acceptable.

For a property with limited information:
approximately 250–500 words is acceptable.

Never add fictional information just to increase the word count.

============================================================
FINAL CHECK BEFORE RESPONSE
============================================================

Before returning the final answer, verify:

1. Property name is exact.
2. RENT/SALE purpose is correct.
3. Locality is correct.
4. Price is unchanged.
5. Area is unchanged.
6. BHK is unchanged.
7. Furnishing is unchanged.
8. Amenities are factual.
9. No invented nearby places.
10. No invented distances.
11. No invented investment claims.
12. No repeated numbered headings.
13. No Markdown # headings.
14. SEO title is under 60 characters.
15. Meta description is under 160 characters.
16. Keywords contain only supplied facts.

Return ONLY the final property listing.
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
