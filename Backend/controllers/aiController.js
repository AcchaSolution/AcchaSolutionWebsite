const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const mongoose = require('mongoose');

// ============================================================
// PROPERTY MODEL
// ============================================================

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
// FINAL STABLE VERSION
// ============================================================

exports.generatePropertyDescription = async (req, res) => {
  try {

    // ==========================================================
    // RECEIVE DATA
    // ==========================================================

    const {
      name,
      propertyName,
      title,

      propertyType,
      category,

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


    // ==========================================================
    // HELPERS
    // ==========================================================

    const clean = (value) => {
      if (
        value === undefined ||
        value === null
      ) {
        return '';
      }

      return String(value).trim();
    };


    const arrayClean = (value) => {

      if (!Array.isArray(value)) {
        return [];
      }

      return value
        .filter(item => clean(item))
        .map(item => clean(item));
    };


    // ==========================================================
    // PROPERTY NAME
    // ==========================================================

    const finalPropertyName =
      clean(propertyName) ||
      clean(name) ||
      clean(title) ||
      'Property';


    // ==========================================================
    // RENT / SALE DETECTION
    // ==========================================================

    const purposeText = [
      clean(listingType),
      clean(type),
      clean(status)
    ]
      .join(' ')
      .toLowerCase();


    let purpose = 'PROPERTY';


    if (
      /\brent\b/.test(purposeText) ||
      /\brental\b/.test(purposeText) ||
      /\brenting\b/.test(purposeText) ||
      /\blease\b/.test(purposeText)
    ) {

      purpose = 'RENT';

    } else if (
      /\bsale\b/.test(purposeText) ||
      /\bsell\b/.test(purposeText) ||
      /\bselling\b/.test(purposeText)
    ) {

      purpose = 'SALE';
    }


    // ==========================================================
    // PROPERTY TYPE
    // ==========================================================

    let finalPropertyType =
      clean(propertyType) ||
      clean(category);


    if (
      !finalPropertyType &&
      clean(type) &&
      !/rent|rental|sale|sell|lease/i.test(
        clean(type)
      )
    ) {

      finalPropertyType =
        clean(type);
    }


    if (!finalPropertyType) {
      finalPropertyType =
        'Not specified';
    }


    // ==========================================================
    // LOCATION
    // ==========================================================

    const locationParts = [
      clean(locality),
      clean(subLocality),
      clean(location),
      clean(city),
      clean(state),
      clean(pincode)
    ]
      .filter(Boolean)
      .filter(
        (value, index, array) =>
          array.indexOf(value) === index
      );


    const completeLocation =
      locationParts.length
        ? locationParts.join(', ')
        : 'Location not specified';


    // ==========================================================
    // PRICE
    // ==========================================================

    const finalPrice =
      clean(price) ||
      clean(budget) ||
      'Not specified';


    // ==========================================================
    // AMENITIES
    // ==========================================================

    let finalAmenities = [];


    if (Array.isArray(amenities)) {

      finalAmenities =
        arrayClean(amenities);

    } else if (clean(amenities)) {

      finalAmenities = [
        clean(amenities)
      ];
    }


    // ==========================================================
    // 🤖 GEMINI
    // ONLY SHORT CONTENT
    // ==========================================================

const model =
  genAI.getGenerativeModel({

    model: 'gemini-3.8-flash',

    generationConfig: {

      temperature: 0.2,

      maxOutputTokens: 500,

      responseMimeType:
        'application/json'
    }
  });

    // ==========================================================
    // VERY SHORT PROMPT
    // ==========================================================

    const prompt = `
Generate ONLY JSON for a real-estate listing.

Use ONLY these facts.
Never invent facts.

Property:
${finalPropertyName}

Purpose:
${purpose}

Type:
${finalPropertyType}

BHK:
${clean(bhk)}

Area:
${clean(area)}

Bathrooms:
${clean(bathrooms)}

Furnishing:
${clean(furnishing)}

Facing:
${clean(facing)}

Floor:
${clean(propertyFloor)}

Total Floors:
${clean(totalFloors)}

Price:
${finalPrice}

Location:
${completeLocation}

Amenities:
${finalAmenities.length ? finalAmenities.join(', ') : 'None'}

Return ONLY this JSON:

{
"overview": "one short complete sentence",
"highlights": ["short fact", "short fact", "short fact"]
}

Do not write anything before or after the JSON.
Do not explain.
Do not reason.
Do not mention instructions.
Do not mention rules.
Do not say "Let's check".
Do not say "double-check".
Do not say "omit".
Do not output markdown.

Overview must be under 180 characters.

Highlights must contain maximum 3 short items.

Do not repeat all property details in the overview.
Do not include price, area, bathrooms, floor, furnishing, facing or amenities in the overview.
Those details are already added by the backend.

Return the smallest valid JSON possible.

`;


// ==========================================================
// GEMINI CALL WITH RETRY
// ==========================================================

let rawText = '';

const sleep = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));

const maxAttempts = 4;

for (let attempt = 1; attempt <= maxAttempts; attempt++) {

  try {

    console.log(
      `🤖 AI PROPERTY DESCRIPTION ATTEMPT ${attempt}/${maxAttempts}`
    );

    const result =
      await model.generateContent(
        prompt
      );

    rawText =
      String(
        result.response.text() || ''
      ).trim();

    console.log(
      '🤖 GEMINI RAW LENGTH:',
      rawText.length
    );

    // Successful response
    if (rawText) {
      break;
    }

    throw new Error(
      'Gemini returned an empty response.'
    );

  } catch (aiError) {

    const status =
      aiError?.status ||
      aiError?.response?.status;

    console.error(
      `❌ GEMINI ATTEMPT ${attempt} FAILED:`,
      status || aiError?.message || aiError
    );

    // Retry only temporary server/busy errors
    const retryable =
      status === 429 ||
      status === 500 ||
      status === 502 ||
      status === 503 ||
      status === 504;

    if (
      retryable &&
      attempt < maxAttempts
    ) {

      const delay =
        attempt === 1
          ? 2000
          : attempt === 2
            ? 5000
            : 10000;

      console.log(
        `⏳ GEMINI RETRYING IN ${delay / 1000}s...`
      );

      await sleep(delay);

      continue;
    }

    console.error(
      '❌ GEMINI FINAL ERROR:',
      aiError
    );

    return res.status(500).json({

      success: false,

      code:
        'AI_GENERATION_ERROR',

      message:
        retryable
          ? 'AI service is temporarily busy. Please try again in a moment.'
          : 'Unable to generate the AI property description. Please try again.'
    });
  }
}


    // ==========================================================
    // CLEAN JSON
    // ==========================================================

    let cleanedJson =
      rawText
        .replace(
          /^```json/i,
          ''
        )
        .replace(
          /^```/,
          ''
        )
        .replace(
          /```$/,
          ''
        )
        .trim();


    const firstBrace =
      cleanedJson.indexOf('{');


    const lastBrace =
      cleanedJson.lastIndexOf('}');


    if (
      firstBrace !== -1 &&
      lastBrace !== -1
    ) {

      cleanedJson =
        cleanedJson.substring(
          firstBrace,
          lastBrace + 1
        );
    }


    // ==========================================================
    // PARSE
    // ==========================================================

    let aiData;


    try {

      aiData =
        JSON.parse(
          cleanedJson
        );

    } catch (parseError) {

      console.error(
        '❌ INVALID GEMINI JSON:',
        rawText
      );


      return res.status(502).json({

        success: false,

        code:
          'AI_INVALID_RESPONSE',

        message:
          'AI returned an invalid response. Please try again.'
      });
    }


    // ==========================================================
    // EXTRACT AI CONTENT
    // ==========================================================

    const overview =
      clean(
        aiData?.overview
      );


    const highlights =
      arrayClean(
        aiData?.highlights
      ).slice(0, 5);


    // ==========================================================
    // BLOCK REASONING / INSTRUCTION LEAK
    // ==========================================================

    const badAIText =
      /let's check|double-check|rules|omit|reasoning|analysis|instruction|character count|output|final check|only supplied facts|i verified/i;


    if (
      badAIText.test(overview) ||
      highlights.some(
        item => badAIText.test(item)
      )
    ) {

      console.error(
        '❌ AI REASONING TEXT DETECTED:',
        {
          overview,
          highlights
        }
      );


      return res.status(502).json({

        success: false,

        code:
          'AI_UNSAFE_OUTPUT',

        message:
          'AI returned an invalid description. Please try again.'
      });
    }


    // ==========================================================
    // OVERVIEW REQUIRED
    // ==========================================================

    if (!overview) {

      return res.status(502).json({

        success: false,

        code:
          'AI_EMPTY_RESPONSE',

        message:
          'AI could not create the property overview. Please try again.'
      });
    }


    // ==========================================================
    // PROPERTY DETAILS
    // ==========================================================

    const details = [];


    if (
      finalPropertyType !==
      'Not specified'
    ) {

      details.push(
        `Property Type: ${finalPropertyType}`
      );
    }


    if (clean(bhk)) {

      details.push(
        `BHK: ${clean(bhk)}`
      );
    }


    if (clean(area)) {

      details.push(
        `Area: ${clean(area)}`
      );
    }


    if (
      finalPrice !==
      'Not specified'
    ) {

      details.push(
        `Price: ${finalPrice}`
      );
    }


    if (clean(bathrooms)) {

      details.push(
        `Bathrooms: ${clean(bathrooms)}`
      );
    }


    if (clean(furnishing)) {

      details.push(
        `Furnishing: ${clean(furnishing)}`
      );
    }


    if (clean(facing)) {

      details.push(
        `Facing: ${clean(facing)}`
      );
    }


    if (clean(propertyFloor)) {

      details.push(
        `Property Floor: ${clean(propertyFloor)}`
      );
    }


    if (clean(totalFloors)) {

      details.push(
        `Total Floors: ${clean(totalFloors)}`
      );
    }


    if (clean(possession)) {

      details.push(
        `Possession: ${clean(possession)}`
      );
    }


    // ==========================================================
    // PURPOSE HEADING
    // ==========================================================

    const purposeHeading =
      purpose === 'RENT'
        ? 'FOR RENT'
        : purpose === 'SALE'
          ? 'FOR SALE'
          : 'PROPERTY';


    // ==========================================================
    // COMPLETE DESCRIPTION
    // ==========================================================

    const sections = [];


    sections.push(
      finalPropertyName
    );


    sections.push(
      purposeHeading
    );


    sections.push(
      `PROPERTY OVERVIEW\n\n${overview}`
    );


    // ==========================================================
    // HIGHLIGHTS
    // ==========================================================

    if (highlights.length) {

      sections.push(
        `KEY PROPERTY HIGHLIGHTS\n\n${
          highlights
            .map(
              item => `• ${item}`
            )
            .join('\n')
        }`
      );
    }


    // ==========================================================
    // DETAILS
    // ==========================================================

    if (details.length) {

      sections.push(
        `PROPERTY DETAILS\n\n${
          details
            .map(
              item => `• ${item}`
            )
            .join('\n')
        }`
      );
    }


    // ==========================================================
    // AMENITIES
    // ==========================================================

    if (finalAmenities.length) {

      sections.push(
        `AMENITIES\n\n${
          finalAmenities
            .map(
              item => `• ${item}`
            )
            .join('\n')
        }`
      );
    }


    // ==========================================================
    // LOCATION
    // ==========================================================

    if (
      completeLocation !==
      'Location not specified'
    ) {

      sections.push(
        `LOCATION\n\n${completeLocation}`
      );
    }


    // ==========================================================
    // CONTACT
    // ==========================================================

    sections.push(
      `CONTACT & SITE VISIT\n\nFor more details or to schedule a site visit, contact AcchaSolution Realty.`
    );


    // ==========================================================
    // SEO GENERATED FROM FACTS
    // NO GEMINI
    // ==========================================================

    let seoTitle =
      finalPropertyName;


    if (clean(bhk)) {

      seoTitle +=
        ` | ${clean(bhk)} BHK`;
    }


    if (
      purpose === 'RENT'
    ) {

      seoTitle +=
        ' for Rent';

    } else if (
      purpose === 'SALE'
    ) {

      seoTitle +=
        ' for Sale';
    }


    const seoLocation =
      clean(locality) ||
      clean(subLocality) ||
      clean(city);


    if (seoLocation) {

      seoTitle +=
        ` in ${seoLocation}`;
    }


    seoTitle =
      seoTitle.substring(
        0,
        60
      ).trim();


    const metaParts = [];


    if (clean(bhk)) {
      metaParts.push(
        `${clean(bhk)} BHK`
      );
    }


    if (finalPropertyType !== 'Not specified') {
      metaParts.push(
        finalPropertyType
      );
    }


    if (purpose === 'RENT') {
      metaParts.push(
        'for rent'
      );
    }


    if (purpose === 'SALE') {
      metaParts.push(
        'for sale'
      );
    }


    if (seoLocation) {
      metaParts.push(
        `in ${seoLocation}`
      );
    }


    const metaDescription =
      (
        `${finalPropertyName} ${metaParts.join(' ')}. ` +
        `Contact AcchaSolution Realty for property details and site visit.`
      )
        .substring(
          0,
          155
        )
        .trim();


    // ==========================================================
    // SEO KEYWORDS
    // ==========================================================

    const keywords = [];


    if (clean(bhk)) {
      keywords.push(
        `${clean(bhk)} BHK`
      );
    }


    if (finalPropertyType !== 'Not specified') {
      keywords.push(
        finalPropertyType
      );
    }


    if (purpose === 'RENT') {
      keywords.push(
        'property for rent'
      );
    }


    if (purpose === 'SALE') {
      keywords.push(
        'property for sale'
      );
    }


    if (seoLocation) {
      keywords.push(
        seoLocation
      );
    }


    if (clean(furnishing)) {
      keywords.push(
        clean(furnishing)
      );
    }


    if (clean(bathrooms)) {
      keywords.push(
        `${clean(bathrooms)} bathrooms`
      );
    }


    if (clean(area)) {
      keywords.push(
        `${clean(area)} area`
      );
    }


    const uniqueKeywords =
      [...new Set(keywords)]
        .slice(0, 8);


    // ==========================================================
    // SEO SECTION
    // ==========================================================

    sections.push(
      `SEO TITLE: ${seoTitle}`
    );


    sections.push(
      `META DESCRIPTION: ${metaDescription}`
    );


    if (
      uniqueKeywords.length
    ) {

      sections.push(
        `SEO KEYWORDS: ${uniqueKeywords.join(', ')}`
      );
    }


    // ==========================================================
    // FINAL LISTING
    // ==========================================================

    const finalListing =
      sections.join(
        '\n\n'
      );


    // ==========================================================
    // FINAL SAFETY
    // ==========================================================

    if (
      badAIText.test(
        finalListing
      )
    ) {

      console.error(
        '❌ FINAL LISTING CONTAINS INVALID AI TEXT'
      );


      return res.status(502).json({

        success: false,

        code:
          'AI_UNSAFE_OUTPUT',

        message:
          'AI returned an invalid description. Please try again.'
      });
    }


    // ==========================================================
    // SUCCESS
    // ==========================================================

    console.log(
      '✅ AI PROPERTY DESCRIPTION GENERATED'
    );


    console.log(
      '📝 FINAL LENGTH:',
      finalListing.length
    );


    console.log(
      '📞 CONTACT INCLUDED:',
      finalListing.includes(
        'contact AcchaSolution Realty.'
      )
    );


    return res.status(200).json({

      success: true,

      text:
        finalListing

    });


  } catch (error) {

    console.error(
      '❌ PROPERTY DESCRIPTION ERROR:',
      error
    );


    let message =
      'Unable to generate the AI property description. Please try again.';


    if (
      error?.message &&
      /API key|authentication|unauthorized/i.test(
        error.message
      )
    ) {

      message =
        'AI service authentication problem hai. Please check the Gemini API key in backend.';

    } else if (
      error?.message &&
      /quota|rate limit|resource exhausted/i.test(
        error.message
      )
    ) {

      message =
        'AI service temporarily busy hai. Please thodi der baad try karein.';

    } else if (
      error?.message &&
      /timeout|timed out|deadline/i.test(
        error.message
      )
    ) {

      message =
        'AI response timeout ho gaya. Please Generate Description dobara try karein.';
    }


    return res.status(500).json({

      success: false,

      code:
        'AI_GENERATION_ERROR',

      message

    });
  }
};



// ============================================================
// 🟢 FEATURE 2: HOMEPAGE SMART AI SEARCH
// IMPORTANT: UNCHANGED
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


    const result =
      await model.generateContent(
        prompt
      );


    const filtersParsed =
      JSON.parse(
        result.response.text()
      );


    let dbQuery = {};


    if (filtersParsed.locality) {

      dbQuery.$or = [

        {
          locality: {
            $regex:
              filtersParsed.locality,
            $options: 'i'
          }
        },

        {
          location: {
            $regex:
              filtersParsed.locality,
            $options: 'i'
          }
        },

        {
          address: {
            $regex:
              filtersParsed.locality,
            $options: 'i'
          }
        }

      ];

    } else if (
      query &&
      query.toLowerCase().includes('whitefield')
    ) {

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


    if (filtersParsed.bhk) {

      dbQuery.bhk = {
        $regex:
          String(
            filtersParsed.bhk
          ),
        $options: 'i'
      };

    }


    const currentMode =
      tabContext ||
      filtersParsed.purpose;


    if (currentMode) {

      dbQuery.$or =
        dbQuery.$or || [];


      dbQuery.$or.push({

        mode: {
          $regex:
            currentMode,
          $options: 'i'
        }

      });


      dbQuery.$or.push({

        purpose: {
          $regex:
            currentMode,
          $options: 'i'
        }

      });


      dbQuery.$or.push({

        type: {
          $regex:
            currentMode,
          $options: 'i'
        }

      });

    }


    console.log(
      "----------------------------------------"
    );


    console.log(
      "AI Parsed Filters:",
      filtersParsed
    );


    console.log(
      "Executing Final Mongoose Query Parameters:",
      JSON.stringify(dbQuery)
    );


    console.log(
      "----------------------------------------"
    );


    const propertiesMatched =
      await Property.find(
        dbQuery
      );


    console.log(
      `Successfully found ${propertiesMatched.length} properties matching query.`
    );


    return res.status(200).json({

      success: true,

      filtersApplied:
        filtersParsed,

      data:
        propertiesMatched

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