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

        const id =
          params.get('id');

        const permalink =
          params.get('permalink');


        console.log(
          '🔎 PROPERTY DETAILS ROUTE PARAMS:',
          {
            id,
            permalink
          }
        );


        // ===================================================
        // ID ROUTE
        // ===================================================

        if (id) {

          this.loadPropertyById(id);

          return;

        }


        // ===================================================
        // PERMALINK ROUTE
        // ===================================================

        if (permalink) {

          this.loadPropertyByPermalink(
            permalink
          );

          return;

        }


        // ===================================================
        // NOTHING FOUND
        // ===================================================

        this.propertyData = null;

        this.errorMessage =
          'Property ID or permalink not found.';

        this.isLoading = false;

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


    const normalized =
      {
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