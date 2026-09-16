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

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import {
  combineLatest
} from 'rxjs';

import emailjs from '@emailjs/browser';


@Component({
  selector: 'app-properties-catalog',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './properties-catalog.component.html',

  styleUrls: [
    './properties-catalog.component.css'
  ]
})


export class PropertiesCatalogComponent
  implements OnInit {


  // =========================================================
  // ALL PROPERTY DATA
  // =========================================================

  allProperties: any[] = [];

  filteredProperties: any[] = [];


  // =========================================================
  // PAGE / MODE
  // =========================================================

  pageTitle: string = '';

  currentMode: string = 'Sale';


  // =========================================================
  // SEARCH FILTERS
  // =========================================================

  selectedLocation: string = '';

  selectedType: string = '';

  selectedKeyword: string = '';

  selectedBhk: string = '';

  selectedStatus: string = '';

  selectedNewProject: boolean = false;


  // =========================================================
  // AI SEARCH
  // =========================================================

  aiFilters: any = null;

  isAiResult: boolean = false;


  // =========================================================
  // CONTACT MODAL
  // =========================================================

  isModalOpen: boolean = false;

  contactForm!: FormGroup;

  selectedPropertyName: string = '';

  isSending: boolean = false;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(

    private route: ActivatedRoute,

    private propService: PropertyService,

    private fb: FormBuilder

  ) {}


  // =========================================================
  // ON INIT
  // =========================================================

  ngOnInit(): void {


    // =======================================================
    // EMAILJS CONTACT FORM
    // =======================================================

    this.contactForm =
      this.fb.group({

        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3)
          ]
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^[6-9][0-9]{9}$'
            )
          ]
        ],

        message: [
          'I am interested in this property. Please share details.',
          Validators.required
        ]

      });


    // =======================================================
    // ROUTE DATA + QUERY PARAMS
    // =======================================================

    combineLatest([

      this.route.data,

      this.route.queryParams

    ]).subscribe({

      next: ([dataRes, paramsRes]) => {


        // ===================================================
        // SALE / RENT / ALL MODE
        // ===================================================

        this.currentMode =
          String(
            dataRes['mode'] || 'Sale'
          );


        // ===================================================
        // PAGE TITLE
        // ===================================================

        const mode =
          this.currentMode
            .trim()
            .toLowerCase();


        if (mode === 'rent') {

          this.pageTitle =
            'Properties For Rent';

        }

        else if (mode === 'commercial') {

          this.pageTitle =
            'Commercial Properties';

        }

        else if (mode === 'all') {

          this.pageTitle =
            'All Properties';

        }

        else {

          this.pageTitle =
            'Properties For Sale';

        }


        // ===================================================
        // QUERY PARAMS
        // ===================================================

        this.selectedLocation =
          String(
            paramsRes['city'] ||
            paramsRes['location'] ||
            ''
          );


        this.selectedType =
          String(
            paramsRes['type'] ||
            ''
          );


        this.selectedKeyword =
          String(
            paramsRes['keyword'] ||
            ''
          );


        this.selectedBhk =
          String(
            paramsRes['bhk'] ||
            ''
          );


        this.selectedStatus =
          String(
            paramsRes['status'] ||
            ''
          );


        this.selectedNewProject =
          String(
            paramsRes['newProject'] ||
            ''
          ).toLowerCase() === 'true';


        // ===================================================
        // LOAD DATA
        // ===================================================

        this.fetchAndFilterData();

      }

    });


    // =======================================================
    // AI DIRECT RESULTS FROM HOME SEARCH
    // =======================================================

    const navigation =
      window.history.state;


    if (
      navigation &&
      navigation['directResults']
    ) {

      const directResults =
        navigation['directResults'];


      if (
        Array.isArray(
          directResults
        )
      ) {

        this.allProperties =
          directResults;

        this.filteredProperties =
          [...directResults];

        this.isAiResult = true;

      }


      this.aiFilters =
        navigation['aiFilters'] || null;


      console.log(
        '🤖 AI DIRECT RESULTS:',
        directResults
      );


      console.log(
        '🤖 AI FILTERS:',
        this.aiFilters
      );

    }

  }


  // =========================================================
  // FETCH PROPERTIES
  // =========================================================

  fetchAndFilterData(): void {


    this.propService
      .getProperties()
      .subscribe({

        next: (list: any[]) => {


          // =================================================
          // API DATA
          // =================================================

          this.allProperties =
            Array.isArray(list)
              ? list
              : [];


          // =================================================
          // AI RESULT EXISTS
          // =================================================

          if (
            this.isAiResult &&
            this.filteredProperties.length > 0
          ) {

            return;

          }


          // =================================================
          // NORMAL FILTERING
          // =================================================

          this.applyAllFilters();

        },


        error: (err: any) => {

          console.error(
            '❌ Error loading properties:',
            err
          );

          this.allProperties = [];

          this.filteredProperties = [];

        }

      });

  }


  // =========================================================
  // APPLY ALL FILTERS
  // =========================================================

  applyAllFilters(): void {


    let result =
      [...this.allProperties];


    // =======================================================
    // 1. SALE / RENT / COMMERCIAL / ALL
    // =======================================================

    const mode =
      this.currentMode
        .trim()
        .toLowerCase();


    // =======================================================
    // VIEW ALL PROPERTIES
    // =======================================================

    if (
      mode !== 'all'
    ) {

      result =
        result.filter(
          (property: any) => {


            const propertyType =
              String(
                property?.type ||
                property?.listingType ||
                property?.transactionType ||
                ''
              )
                .trim()
                .toLowerCase();


            const category =
              String(
                property?.category ||
                property?.propertyCategory ||
                property?.propertyType ||
                ''
              )
                .trim()
                .toLowerCase();


            // -------------------------------------------------
            // RENT
            // -------------------------------------------------

            if (
              mode === 'rent'
            ) {

              return (
                propertyType === 'rent' ||
                propertyType === 'rental'
              );

            }


            // -------------------------------------------------
            // COMMERCIAL
            // -------------------------------------------------

            if (
              mode === 'commercial'
            ) {

              return (
                category.includes('commercial') ||
                propertyType.includes('commercial')
              );

            }


            // -------------------------------------------------
            // SALE
            // -------------------------------------------------

            return (
              propertyType === 'sale' ||
              propertyType === 'sell' ||
              propertyType === 'buy'
            );

          }
        );

    }


    // =======================================================
    // 2. LOCATION / CITY
    // =======================================================

    if (
      this.selectedLocation
        .trim()
    ) {

      const locationSearch =
        this.normalize(
          this.selectedLocation
        );


      result =
        result.filter(
          (property: any) => {


            const location =
              this.normalize(
                property?.location
              );


            const city =
              this.normalize(
                property?.city
              );


            const locality =
              this.normalize(
                property?.locality
              );


            const address =
              this.normalize(
                property?.address
              );


            return (

              location.includes(
                locationSearch
              ) ||

              city.includes(
                locationSearch
              ) ||

              locality.includes(
                locationSearch
              ) ||

              address.includes(
                locationSearch
              )

            );

          }
        );

    }


    // =======================================================
    // 3. KEYWORD / NATURAL SEARCH
    // =======================================================

    if (
      this.selectedKeyword
        .trim()
    ) {


      const keyword =
        this.normalize(
          this.selectedKeyword
        );


      const keywordWords =
        keyword
          .split(/\s+/)
          .filter(
            word => word.length > 1
          );


      result =
        result.filter(
          (property: any) => {


            const searchableText =
              this.normalize(
                [

                  property?.name,

                  property?.location,

                  property?.city,

                  property?.locality,

                  property?.address,

                  property?.description,

                  property?.uniqueId,

                  property?.bhk,

                  property?.propertyType,

                  property?.category,

                  property?.status

                ]
                  .filter(Boolean)
                  .join(' ')
              );


            // ------------------------------------------------
            // FULL QUERY MATCH
            // ------------------------------------------------

            if (
              searchableText.includes(
                keyword
              )
            ) {

              return true;

            }


            // ------------------------------------------------
            // WORD MATCH
            // ------------------------------------------------

            if (
              keywordWords.length > 0
            ) {

              const matchingWords =
                keywordWords.filter(
                  word =>
                    searchableText.includes(
                      word
                    )
                );


              return (
                matchingWords.length >=
                Math.min(
                  2,
                  keywordWords.length
                )
              );

            }


            return false;

          }
        );

    }


    // =======================================================
    // 4. BHK
    // =======================================================

    if (
      this.selectedBhk
        .trim()
    ) {


      const requiredBhk =
        this.extractBhk(
          this.selectedBhk
        );


      if (
        requiredBhk
      ) {

        result =
          result.filter(
            (property: any) => {


              const propertyBhk =
                this.extractBhk(

                  property?.bhk ||

                  property?.bhkType ||

                  property?.bedrooms ||

                  property?.bedroom ||

                  ''

                );


              return (
                propertyBhk ===
                requiredBhk
              );

            }
          );

      }

    }


    // =======================================================
    // 5. PROPERTY STATUS
    // =======================================================

    if (
      this.selectedStatus
        .trim()
    ) {


      const requestedStatus =
        this.normalize(
          this.selectedStatus
        );


      result =
        result.filter(
          (property: any) => {


            const status =
              this.normalize(

                property?.status ||

                property?.propertyStatus ||

                property?.possession ||

                ''

              );


            return (

              status.includes(
                requestedStatus
              ) ||

              requestedStatus.includes(
                status
              )

            );

          }
        );

    }


    // =======================================================
    // 6. NEW BUILDER PROJECT
    // =======================================================

    if (
      this.selectedNewProject
    ) {

      result =
        result.filter(
          (property: any) => {


            return (

              property?.isBuilderProject === true ||

              property?.newBuilderProject === true ||

              property?.isNewProject === true ||

              property?.builderProject === true ||

              property?.builderName ||

              property?.builder

            );

          }
        );

    }


    // =======================================================
    // FINAL RESULT
    // =======================================================

    this.filteredProperties =
      [...result];


    console.log(
      '================================'
    );


    console.log(
      '🏠 CATALOG SEARCH'
    );


    console.log(
      'MODE:',
      this.currentMode
    );


    console.log(
      'LOCATION:',
      this.selectedLocation
    );


    console.log(
      'KEYWORD:',
      this.selectedKeyword
    );


    console.log(
      'TYPE:',
      this.selectedType
    );


    console.log(
      'BHK:',
      this.selectedBhk
    );


    console.log(
      'STATUS:',
      this.selectedStatus
    );


    console.log(
      'NEW PROJECT:',
      this.selectedNewProject
    );


    console.log(
      'TOTAL RESULT:',
      this.filteredProperties.length
    );


    console.log(
      'RESULT:',
      this.filteredProperties
    );


    console.log(
      '================================'
    );

  }


  // =========================================================
  // NORMALIZE TEXT
  // =========================================================

  private normalize(
    value: any
  ): string {

    return String(
      value ?? ''
    )
      .trim()
      .toLowerCase();

  }


  // =========================================================
  // EXTRACT BHK
  // =========================================================

  private extractBhk(
    value: any
  ): string {

    const text =
      String(
        value ?? ''
      )
        .trim()
        .toLowerCase();


    const match =
      text.match(
        /(\d+)\s*bhk/
      );


    if (match) {

      return match[1];

    }


    // Numeric bedrooms support

    if (
      /^\d+$/.test(text)
    ) {

      return text;

    }


    return '';

  }


  // =========================================================
  // CONTACT MODAL
  // =========================================================

  openContactModal(
    propertyName: string,
    event: Event
  ): void {


    event.stopPropagation();


    this.selectedPropertyName =
      propertyName ||
      'Premium Project';


    this.isModalOpen =
      true;


    this.isSending =
      false;

  }


  // =========================================================
  // CLOSE CONTACT MODAL
  // =========================================================

  closeContactModal(): void {


    this.isModalOpen =
      false;


    this.isSending =
      false;


    this.contactForm.reset({

      message:
        'I am interested in this property. Please share details.'

    });

  }


  // =========================================================
  // SUBMIT CONTACT FORM
  // =========================================================

  onFormSubmit(): void {


    // =======================================================
    // INVALID FORM
    // =======================================================

    if (
      this.contactForm.invalid
    ) {

      this.contactForm
        .markAllAsTouched();

      return;

    }


    // =======================================================
    // START SENDING
    // =======================================================

    this.isSending =
      true;


    const formData =
      this.contactForm.value;


    // =======================================================
    // EMAILJS PARAMETERS
    // =======================================================

    const templateParams = {

      from_name:
        formData.name,

      from_email:
        formData.email,

      from_phone:
        formData.phone,

      property_name:
        this.selectedPropertyName,

      property_mode:
        this.currentMode,

      message:
        formData.message,

      to_email:
        'tanubanglore35@gmail.com'

    };


    // =======================================================
    // EMAILJS SEND
    // =======================================================

    emailjs
      .send(

        'service_9y43p7s',

        'template_iqbq08',

        templateParams,

        '_nVTQY1_5G4CvpGdD'

      )

      .then(
        () => {


          alert(

            `✨ Inquiry Received! We have shared your details with the agent for "${this.selectedPropertyName}". Expect a call back soon.`

          );


          this.closeContactModal();

        }

      )

      .catch(
        (error: any) => {


          console.error(
            '❌ EmailJS Delivery Failure:',
            error
          );


          alert(

            '❌ System connection issue. Please check your EmailJS API keys configuration.'

          );


          this.isSending =
            false;

        }

      );

  }


  // =========================================================
  // PRICE FORMATTER
  // =========================================================

  formatPrice(
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


    // =======================================================
    // CRORE
    // =======================================================

    if (
      numPrice >= 10000000
    ) {

      const crore =
        Math.floor(
          numPrice /
          10000000
        );


      const remainder =
        numPrice %
        10000000;


      const lakh =
        Math.round(
          remainder /
          100000
        );


      if (
        lakh > 0
      ) {

        return (
          `₹${crore} Crore ${lakh} Lakh`
        );

      }


      return (
        `₹${crore} Crore`
      );

    }


    // =======================================================
    // LAKH
    // =======================================================

    if (
      numPrice >= 100000
    ) {

      return (

        `₹${(
          numPrice /
          100000
        ).toFixed(2)} Lakh`

      );

    }


    // =======================================================
    // NORMAL PRICE
    // =======================================================

    return (

      '₹' +
      numPrice.toLocaleString(
        'en-IN'
      )

    );

  }


  // =========================================================
  // PROPERTY DETAILS
  // =========================================================

  openPropertyDetails(
    property: any,
    event?: Event
  ): void {


    if (event) {

      event.stopPropagation();

    }


    if (!property) {

      return;

    }


    const id =
      property.id ||
      property.uniqueId;


    if (!id) {

      console.error(
        'Property ID not found:',
        property
      );

      return;

    }


    // RouterLink HTML already handles this,
    // but this method is available for buttons.

  }


}
