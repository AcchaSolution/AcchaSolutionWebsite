import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  RouterModule
} from '@angular/router';

import {
  PropertyService
} from '../services/property.service';


@Component({
  selector: 'app-property-details',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule
  ],

  templateUrl:
    './property-details.component.html',

  styleUrls: [
    './property-details.component.css'
  ]
})


export class PropertyDetailsComponent
  implements OnInit {


  // =========================================================
  // PROPERTY DATA
  // =========================================================

  propertyData: any = null;


  // =========================================================
  // IMAGE SLIDER
  // =========================================================

  activeImageIndex: number = 0;


  // =========================================================
  // LOADING
  // =========================================================

  isLoading: boolean = true;


  // =========================================================
  // ERROR
  // =========================================================

  errorMessage: string = '';


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private route: ActivatedRoute,
    private propService: PropertyService
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.route.paramMap.subscribe(
      params => {

        const value =
          params.get('id');


        console.log(
          '🔎 PROPERTY DETAILS ROUTE VALUE:',
          value
        );


        // ===================================================
        // NOTHING FOUND
        // ===================================================

        if (!value) {

          this.propertyData = null;

          this.errorMessage =
            'Property ID or permalink not found.';

          this.isLoading = false;

          return;

        }


        // ===================================================
        // CHECK MONGODB OBJECT ID
        // ===================================================

        const isMongoId =
          /^[a-f\d]{24}$/i.test(value);


        // ===================================================
        // OLD ID URL
        // Example:
        // /property-details/6aabb0f1ea3fc368c42768da
        // ===================================================

        if (isMongoId) {

          console.log(
            '🆔 MongoDB ID detected:',
            value
          );


          this.loadPropertyById(
            value
          );


          return;

        }


        // ===================================================
        // NEW SEO PROPERTY URL
        // Example:
        // /property-details/gopalan-millennium-habitat
        // ===================================================

        console.log(
          '🔗 Property slug detected:',
          value
        );


        this.loadPropertyByPermalink(
          value
        );

      }
    );

  }


  // =========================================================
  // LOAD PROPERTY BY ID
  // =========================================================

  private loadPropertyById(
    id: string
  ): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.propertyData = null;

    this.activeImageIndex = 0;


    console.log(
      '🏠 Loading property:',
      id
    );


    this.propService
      .getPropertyById(id)
      .subscribe({

        next: (property) => {

          console.log(
            '✅ PROPERTY DETAILS RECEIVED:',
            property
          );


          if (!property) {

            this.propertyData = null;

            this.errorMessage =
              `Property not found for ID: ${id}`;

            this.isLoading = false;

            return;

          }


          // -------------------------------------------------
          // PROPERTY FOUND
          // -------------------------------------------------

          this.propertyData =
            this.normalizeProperty(property);

          this.activeImageIndex = 0;

          this.isLoading = false;


          console.log(
            '✅ FINAL PROPERTY DATA:',
            this.propertyData
          );

        },


        error: (error) => {

          console.error(
            '❌ PROPERTY DETAILS API ERROR:',
            error
          );


          this.propertyData = null;


          if (
            error?.status === 404
          ) {

            this.errorMessage =
              `Property not found for ID: ${id}`;

          }

          else {

            this.errorMessage =
              'Unable to load property details. Please try again.';

          }


          this.isLoading = false;

        }

      });

  }


  // =========================================================
  // LOAD PROPERTY BY PERMALINK
  // =========================================================

  private loadPropertyByPermalink(
    slug: string
  ): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.propertyData = null;

    this.activeImageIndex = 0;


    console.log(
      '🔗 Loading property by permalink:',
      slug
    );


    this.propService
      .getPropertyByPermalink(slug)
      .subscribe({

        next: (property) => {

          console.log(
            '✅ PROPERTY BY PERMALINK:',
            property
          );


          
          if (!property) {

            this.propertyData = null;

            this.errorMessage =
              `Property not found for permalink: ${slug}`;

            this.isLoading = false;

            return;

          }


          this.propertyData =
            this.normalizeProperty(property);

          this.activeImageIndex = 0;

          this.isLoading = false;

        },


        error: (error) => {

          console.error(
            '❌ PERMALINK API ERROR:',
            error
          );


          this.propertyData = null;


          if (
            error?.status === 404
          ) {

            this.errorMessage =
              `Property not found for permalink: ${slug}`;

          }

          else {

            this.errorMessage =
              'Unable to load property details.';

          }


          this.isLoading = false;

        }

      });

  }
// =========================================================
// NORMALIZE PROPERTY
// =========================================================

private normalizeProperty(
  property: any
): any {

  if (!property) {

    return null;

  }


  const normalized = {
    ...property
  };


  // -------------------------------------------------------
  // MONGODB ID SUPPORT
  // -------------------------------------------------------

  if (
    !normalized.id &&
    normalized._id
  ) {

    normalized.id =
      String(normalized._id);

  }


  // -------------------------------------------------------
  // UNIQUE ID SUPPORT
  // -------------------------------------------------------

  if (
    !normalized.uniqueId &&
    normalized.id
  ) {

    normalized.uniqueId =
      normalized.id;

  }


  // -------------------------------------------------------
  // GALLERY SAFETY
  // -------------------------------------------------------

  if (
    !Array.isArray(
      normalized.gallery
    )
  ) {

    normalized.gallery = [];

  }


  // -------------------------------------------------------
  // AMENITIES SAFETY
  // -------------------------------------------------------

  if (
    !Array.isArray(
      normalized.selectedAmenities
    )
  ) {

    normalized.selectedAmenities = [];

  }


  // -------------------------------------------------------
  // IMAGE URL FALLBACK
  // -------------------------------------------------------

  if (
    normalized.gallery.length === 0
  ) {

    if (
      normalized.image
    ) {

      normalized.gallery = [
        {
          url: normalized.image
        }
      ];

    }

    else if (
      normalized.imageUrl
    ) {

      normalized.gallery = [
        {
          url: normalized.imageUrl
        }
      ];

    }

  }


  // =======================================================
  // AGENT / OWNER DETAILS NORMALIZATION
  // =======================================================

  const agent =
    normalized.agent ||
    normalized.agentDetails ||
    normalized.postedBy ||
    normalized.owner ||
    {};


  // -------------------------------------------------------
  // NAME
  // -------------------------------------------------------

  normalized.postedByName =
    normalized.postedByName ||
    normalized.agentName ||
    normalized.ownerName ||
    agent?.name ||
    agent?.fullName ||
    agent?.displayName ||
    '';


  // -------------------------------------------------------
  // EMAIL
  // -------------------------------------------------------

  normalized.postedByEmail =
    normalized.postedByEmail ||
    normalized.agentEmail ||
    normalized.ownerEmail ||
    agent?.email ||
    '';


  // -------------------------------------------------------
  // PHONE
  // -------------------------------------------------------

  normalized.postedByPhone =
    normalized.postedByPhone ||
    normalized.agentPhone ||
    normalized.ownerPhone ||
    agent?.phone ||
    agent?.mobile ||
    agent?.phoneNumber ||
    '';


  // -------------------------------------------------------
  // KEEP AGENT OBJECT ALSO
  // -------------------------------------------------------

  if (
    !normalized.agent &&
    Object.keys(agent).length > 0
  ) {

    normalized.agent = agent;

  }


  // -------------------------------------------------------
  // DEBUG
  // -------------------------------------------------------

  console.log(
    '👤 NORMALIZED AGENT DATA:',
    {
      name:
        normalized.postedByName,

      email:
        normalized.postedByEmail,

      phone:
        normalized.postedByPhone,

      agent:
        normalized.agent
    }
  );


  return normalized;

}
  // =========================================================
  // PRICE FORMAT
  // =========================================================

  formatDisplayPrice(
    price: any
  ): string {

    const numPrice =
      Number(price);


    if (
      !numPrice ||
      isNaN(numPrice)
    ) {

      return '₹0';

    }


    if (
      numPrice >= 10000000
    ) {

      const crore =
        Math.floor(
          numPrice / 10000000
        );


      const lakh =
        Math.round(
          (
            numPrice % 10000000
          ) / 100000
        );


      return lakh > 0
        ? `₹${crore} Crore ${lakh} Lakh`
        : `₹${crore} Crore`;

    }


    if (
      numPrice >= 100000
    ) {

      const lakh =
        (
          numPrice / 100000
        ).toFixed(2);


      return `₹${lakh} Lakh`;

    }


    return (
      '₹' +
      numPrice.toLocaleString(
        'en-IN'
      )
    );

  }


  // =========================================================
  // SET ACTIVE IMAGE
  // =========================================================

  setActiveImage(
    index: number
  ): void {

    const gallery =
      this.propertyData?.gallery;


    if (
      !Array.isArray(gallery) ||
      gallery.length === 0
    ) {

      return;

    }


    if (
      index < 0 ||
      index >= gallery.length
    ) {

      return;

    }


    this.activeImageIndex =
      index;

  }


  // =========================================================
  // NEXT IMAGE
  // =========================================================

  nextImage(): void {

    const gallery =
      this.propertyData?.gallery;


    if (
      !Array.isArray(gallery) ||
      gallery.length === 0
    ) {

      return;

    }


    this.activeImageIndex =
      (
        this.activeImageIndex + 1
      ) %
      gallery.length;

  }


  // =========================================================
  // PREVIOUS IMAGE
  // =========================================================

  prevImage(): void {

    const gallery =
      this.propertyData?.gallery;


    if (
      !Array.isArray(gallery) ||
      gallery.length === 0
    ) {

      return;

    }


    this.activeImageIndex =
      (
        this.activeImageIndex -
        1 +
        gallery.length
      ) %
      gallery.length;

  }


  // =========================================================
  // COPY PERMALINK
  // =========================================================

  copyPermalink(): void {

    const permalink =
      this.propertyData?.permalink;


    if (!permalink) {

      return;

    }


    navigator.clipboard
      .writeText(permalink)

      .then(() => {

        alert(
          'Property link copied successfully! 🔗'
        );

      })

      .catch((error) => {

        console.error(
          'Copy link failed:',
          error
        );

        alert(
          'Unable to copy property link.'
        );

      });

  }


  // =========================================================
  // COPY PROPERTY LINK
  // =========================================================

  async copyPropertyLink(): Promise<void> {

    const permalink =
      this.propertyData?.permalink;


    if (!permalink) {

      return;

    }


    try {

      await navigator
        .clipboard
        .writeText(permalink);


      alert(
        'Property link copied successfully! 🔗'
      );

    }

    catch (error) {

      console.error(
        'Unable to copy property link:',
        error
      );

      alert(
        'Unable to copy property link.'
      );

    }

  }


  // =========================================================
  // FORMAT AI DESCRIPTION
  // Converts plain AI text into structured HTML
  // Removes visible HTML tags and SEO metadata
  // =========================================================

  formatDescription(
    description: string
  ): string {

    if (!description) {

      return '';

    }


    // -------------------------------------------------------
    // STEP 1 — CONVERT VALUE TO STRING
    // -------------------------------------------------------

    let text =
      String(description)
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();


    if (!text) {

      return '';

    }


    // -------------------------------------------------------
    // STEP 2 — REMOVE LITERAL / ESCAPED HTML TAGS
    //
    // Handles:
    // <p>
    // </p>
    // \<p>
    // \</p>
    // <br>
    // <div>
    // -------------------------------------------------------

    text =
      text
        .replace(/\\<br\s*\/?\\?>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')

        .replace(/\\<\/p>/gi, '\n')
        .replace(/\\<p[^>]*>/gi, '')

        .replace(/<\/p>/gi, '\n')
        .replace(/<p[^>]*>/gi, '')

        .replace(/\\<\/div>/gi, '\n')
        .replace(/\\<div[^>]*>/gi, '')

        .replace(/<\/div>/gi, '\n')
        .replace(/<div[^>]*>/gi, '')

        .replace(/<[^>]*>/g, '');



    // -------------------------------------------------------
    // STEP 3 — REMOVE MARKDOWN HEADING SYMBOLS
    //
    // ### Property Overview
    // becomes:
    // Property Overview
    // -------------------------------------------------------

    text =
      text.replace(
        /^\s*#{1,6}\s*/gm,
        ''
      );


    // -------------------------------------------------------
    // STEP 4 — REMOVE ESCAPED MARKDOWN SYMBOLS
    // -------------------------------------------------------

    text =
      text.replace(
        /\\#/g,
        ''
      );


    // -------------------------------------------------------
    // STEP 5 — REMOVE SEO METADATA
    //
    // These should NEVER appear in the visible property
    // description.
    // -------------------------------------------------------

    text =
      text.replace(
        /(?:^|\n)\s*SEO\s*Title\s*:?.*?(?=\n|$)/gi,
        ''
      );


    text =
      text.replace(
        /(?:^|\n)\s*Meta\s*Description\s*:?.*?(?=\n|$)/gi,
        ''
      );


    text =
      text.replace(
        /(?:^|\n)\s*SEO\s*Keywords?\s*:?.*?(?=\n|$)/gi,
        ''
      );


    text =
      text.replace(
        /(?:^|\n)\s*Keywords?\s*:?.*?(?=\n|$)/gi,
        ''
      );


    // -------------------------------------------------------
    // STEP 6 — REMOVE SEO BLOCK IF IT IS AT THE END
    // -------------------------------------------------------

    text =
      text.replace(
        /(?:^|\n)\s*SEO\s*(?:Information|Metadata|Details)\s*:?.*$/gis,
        ''
      );


    // -------------------------------------------------------
    // STEP 7 — REMOVE SECTION NUMBERING
    //
    // 1. Property Overview
    // 2. Key Property Highlights
    // -------------------------------------------------------

    text =
      text.replace(
        /(\n|^)\s*\d+\.\s*(?=(?:Property Overview|Key Property Highlights|Interior & Space|Amenities|Location|Property Details|Contact & Site Visit))/gi,
        '$1'
      );


    // -------------------------------------------------------
    // STEP 8 — FORCE SECTION BREAKS
    // -------------------------------------------------------

    const sectionNames =
      [
        'Property Overview',
        'Key Property Highlights',
        'Interior & Space',
        'Amenities',
        'Location',
        'Property Details',
        'Contact & Site Visit'
      ];


    sectionNames.forEach(
      section => {

        const escapedSection =
          section.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
          );


        const sectionRegex =
          new RegExp(
            `\\s*(?:\\d+\\.\\s*)?(${escapedSection})\\s*:?\\s*`,
            'gi'
          );


        text =
          text.replace(
            sectionRegex,
            '\n§§SECTION§§$1\n'
          );

      }
    );


    // -------------------------------------------------------
    // STEP 9 — NORMALIZE BULLETS
    // -------------------------------------------------------

    text =
      text
        .replace(
          /\s+-\s+(?=[A-Z][^-\n]{1,100}:)/g,
          '\n- '
        )
        .replace(
          /\s+•\s+/g,
          '\n• '
        )
        .replace(
          /\s+\*\s+/g,
          '\n* '
        );


    // -------------------------------------------------------
    // STEP 10 — REMOVE LONE DASHES
    // -------------------------------------------------------

    text =
      text.replace(
        /(?:^|\n)\s*(?:-|–|—)\s*(?=\n|$)/g,
        '\n'
      );


    // -------------------------------------------------------
    // STEP 11 — CLEAN ESCAPED SLASHES
    // -------------------------------------------------------

    text =
      text.replace(
        /\\(?=\s|$)/g,
        ''
      );


    // -------------------------------------------------------
    // STEP 12 — CREATE CLEAN LINES
    // -------------------------------------------------------

    const lines =
      text
        .split(/\n|§§SECTION§§/)
        .map(
          line =>
            line
              .replace(/\s+/g, ' ')
              .trim()
        )
        .filter(
          line =>
            line.length > 0
        );


    // -------------------------------------------------------
    // STEP 13 — BUILD HTML
    // -------------------------------------------------------

    let html = '';

    let listOpen =
      false;


    const closeList =
      () => {

        if (listOpen) {

          html += '</ul>';

          listOpen = false;

        }

      };


    for (
      let i = 0;
      i < lines.length;
      i++
    ) {

      const line =
        lines[i];


      // -----------------------------------------------------
      // SECTION HEADING
      // -----------------------------------------------------

      const sectionMatch =
        line.match(
          /^(?:\d+\.\s*)?(Property Overview|Key Property Highlights|Interior & Space|Amenities|Location|Property Details|Contact & Site Visit)\s*:?\s*$/i
        );


      if (
        sectionMatch
      ) {

        closeList();


        html +=
          `<h3>${sectionMatch[1]}</h3>`;


        continue;

      }


      // -----------------------------------------------------
      // BULLET POINT
      // -----------------------------------------------------

      const bulletMatch =
        line.match(
          /^[-•*]\s+(.+)$/
        );


      if (
        bulletMatch
      ) {

        if (!listOpen) {

          html += '<ul>';

          listOpen = true;

        }


        html +=
          `<li>${bulletMatch[1]}</li>`;


        continue;

      }


      // -----------------------------------------------------
      // CLOSE LIST BEFORE NORMAL PARAGRAPH
      // -----------------------------------------------------

      closeList();


      // -----------------------------------------------------
      // PROPERTY TITLE / FIRST LINE
      // -----------------------------------------------------

      if (
        i === 0
      ) {

        html +=
          `<p class="description-property-title">${line}</p>`;

        continue;

      }


      // -----------------------------------------------------
      // NORMAL PARAGRAPH
      // -----------------------------------------------------

      html +=
        `<p>${line}</p>`;

    }


    // -------------------------------------------------------
    // CLOSE FINAL LIST
    // -------------------------------------------------------

    closeList();


    return html;

  }


  // =========================================================
  // PERMALINK SLUG
  // =========================================================

  getPermalinkSlug(
    permalink: string
  ): string {

    if (!permalink) {

      return '';

    }


    let value =
      String(permalink)
        .trim();


    // Full URL
    try {

      if (
        value.startsWith('http://') ||
        value.startsWith('https://')
      ) {

        const url =
          new URL(value);

        value =
          url.pathname;

      }

    }

    catch {

      // Continue

    }


    return value

      .replace(
        /^\/?properties\//i,
        ''
      )

      .replace(
        /\/+$/,
        ''
      );

  }

}