import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { AuthService } from '../services/auth.service';
import {
  PropertyService
} from '../services/property.service';

import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import {
  CKEditorModule
} from '@ckeditor/ckeditor5-angular';

import * as ClassicEditor
  from '@ckeditor/ckeditor5-build-classic';

import { HttpClient } from '@angular/common/http';

declare var Quill: any;
declare var L: any;


@Component({
  selector: 'app-add-property-form',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CKEditorModule
  ],

  templateUrl: './add-property-form.component.html',

  styleUrls: [
    './add-property-form.component.css'
  ]
})


export class AddPropertyFormComponent
  implements OnInit, AfterViewInit, OnDestroy {


  // =========================================================
  // FORM
  // =========================================================

  propertyForm!: FormGroup;


  // =========================================================
  // EDIT MODE
  // =========================================================

  isEditMode: boolean = false;

  editingPropertyId: string | null = null;


  // =========================================================
  // EDITOR
  // =========================================================

  public Editor: any = ClassicEditor;

  quillInstance: any = null;

  showFurnishingCard: boolean = false;


  // =========================================================
  // GALLERY
  // =========================================================

  uploadedImages: any[] = [];


  // =========================================================
  // MAP
  // =========================================================

  map: any = null;

  marker: any = null;


  // =========================================================
  // PERMALINK
  // =========================================================

  private readonly BASE_PERMALINK =
    'https://acchaSolution.com/properties/';


  // =========================================================
  // UI STATES
  // =========================================================

  isLinkIconDisabled: boolean = false;

  isAiGenerating: boolean = false;

  isUploadingImages: boolean = false;

  priceMarketPosition: number = 65;


  // =========================================================
  // AMENITIES
  // =========================================================

  amenities = [

    {
      id: 1,
      name: 'Swimming Pool',
      icon: 'pool',
      selected: false
    },

    {
      id: 2,
      name: 'Gym',
      icon: 'fitness_center',
      selected: false
    },

    {
      id: 3,
      name: 'Club House',
      icon: 'apartment',
      selected: false
    },

    {
      id: 4,
      name: 'Children Play Area',
      icon: 'child_care',
      selected: false
    },

    {
      id: 5,
      name: 'Jogging Track',
      icon: 'directions_run',
      selected: false
    },

    {
      id: 6,
      name: 'Power Backup',
      icon: 'battery_charging_full',
      selected: false
    },

    {
      id: 7,
      name: 'Lift',
      icon: 'elevator',
      selected: false
    },

    {
      id: 8,
      name: '24x7 Security',
      icon: 'security',
      selected: false
    },

    {
      id: 9,
      name: 'CCTV',
      icon: 'videocam',
      selected: false
    },

    {
      id: 10,
      name: 'Intercom',
      icon: 'call',
      selected: false
    },

    {
      id: 11,
      name: 'Parking',
      icon: 'local_parking',
      selected: false
    },

    {
      id: 12,
      name: 'Visitor Parking',
      icon: 'directions_car',
      selected: false
    },

    {
      id: 13,
      name: 'EV Charging',
      icon: 'ev_station',
      selected: false
    },

    {
      id: 14,
      name: 'Garden',
      icon: 'yard',
      selected: false
    },

    {
      id: 15,
      name: 'Private Terrace',
      icon: 'deck',
      selected: false
    },

    {
      id: 16,
      name: 'Smart Home',
      icon: 'hub',
      selected: false
    },

    {
      id: 17,
      name: 'WiFi',
      icon: 'wifi',
      selected: false
    },

    {
      id: 18,
      name: 'Tennis Court',
      icon: 'sports_tennis',
      selected: false
    },

    {
      id: 19,
      name: 'Basketball Court',
      icon: 'sports_basketball',
      selected: false
    },

    {
      id: 20,
      name: 'Badminton Court',
      icon: 'sports',
      selected: false
    },

    {
      id: 21,
      name: 'Party Hall',
      icon: 'celebration',
      selected: false
    },

    {
      id: 22,
      name: 'Library',
      icon: 'menu_book',
      selected: false
    },

    {
      id: 23,
      name: 'Indoor Games',
      icon: 'sports_esports',
      selected: false
    },

    {
      id: 24,
      name: 'Spa',
      icon: 'spa',
      selected: false
    },

    {
      id: 25,
      name: 'Pet Park',
      icon: 'pets',
      selected: false
    }

  ];


  // =========================================================
  // CATEGORIES
  // =========================================================

  categories = [

    {
      name: 'Apartment',
      checked: false
    },

    {
      name: 'Villa',
      checked: false
    },

    {
      name: 'Condo',
      checked: false
    },

    {
      name: 'Commercial',
      checked: true
    }

  ];


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(

    private fb: FormBuilder,

    private propService: PropertyService,

    private router: Router,

    private route: ActivatedRoute,

    private http: HttpClient,
      private authService: AuthService


  ) {}


  // =========================================================
  // ON INIT
  // =========================================================

  ngOnInit(): void {

    // -------------------------------------------------------
    // CREATE FORM
    // -------------------------------------------------------

    this.propertyForm =
      this.fb.group({

        id: [''],

        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3)
          ]
        ],

        permalink: [
          this.BASE_PERMALINK,
          Validators.required
        ],

        type: [''],

        description: [''],

        status: [''],

        is_featured: [false],

        priority: [
          10,
          [
            Validators.min(1),
            Validators.max(100)
          ]
        ],

        uniqueId: [''],

        price: [
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ],

        area: [
          '',
          Validators.required
        ],

        bhk: [
          '',
          [
            Validators.required,
            Validators.min(0)
          ]
        ],

        totalFloors: [
          '',
          [
            Validators.required,
            Validators.min(0)
          ]
        ],

        propertyFloor: [
          '',
          [
            Validators.required,
            Validators.min(0)
          ]
        ],

        furnishing: [''],

        facing: [''],

        bathrooms: [
          '',
          [
            Validators.required,
            Validators.min(1)
          ]
        ],

        possession: ['Ready to Move'],

        rating: ['5'],

        latitude: [12.9698],

        longitude: [77.7500],

        location: ['All Cities']

      });


    // -------------------------------------------------------
    // GENERATE NEW PROPERTY ID
    // -------------------------------------------------------

    this.generateNewId();


    // -------------------------------------------------------
    // CHECK EDIT ID
    //
    // Supports:
    //
    // /property?id=PROP-1234
    //
    // AND
    //
    // /property/PROP-1234
    // -------------------------------------------------------

    const queryId =
      this.route.snapshot.queryParamMap.get('id');

    const routeId =
      this.route.snapshot.paramMap.get('id');

    const propertyId =
      queryId || routeId;


    if (propertyId) {

      this.isEditMode = true;

      this.editingPropertyId =
        propertyId.trim();

      console.log(
        '✏️ EDIT MODE:',
        this.editingPropertyId
      );

      this.loadPropertyDataToForm(
        this.editingPropertyId
      );

    }


    // -------------------------------------------------------
    // PROPERTY NAME → PERMALINK
    // -------------------------------------------------------

    this.propertyForm
      .get('name')
      ?.valueChanges
      .subscribe(
        (nameValue: string) => {

          if (this.isEditMode) {

            /*
             * In edit mode, the permalink is not
             * automatically changed unless the
             * property name is changed.
             *
             * When the name changes, a new slug is generated.
             */

          }


          if (nameValue) {

            const slug =
              String(nameValue)

                .toLowerCase()

                .trim()

                .replace(
                  /\s+/g,
                  '-'
                )

                .replace(
                  /[^a-z0-9-]/g,
                  ''
                );


            const fullGeneratedUrl =
              `${this.BASE_PERMALINK}${slug}`;


            this.propertyForm.patchValue(
              {
                permalink:
                  fullGeneratedUrl
              },
              {
                emitEvent: false
              }
            );

          }

          else {

            this.propertyForm.patchValue(
              {
                permalink:
                  this.BASE_PERMALINK
              },
              {
                emitEvent: false
              }
            );

          }

        }
      );


    // -------------------------------------------------------
    // PERMALINK PROTECTION
    // -------------------------------------------------------

    this.propertyForm
      .get('permalink')
      ?.valueChanges
      .subscribe(
        (currentUrl: string) => {

          if (
            currentUrl &&
            currentUrl.startsWith(
              this.BASE_PERMALINK
            )
          ) {

            return;

          }


          if (!currentUrl) {

            return;

          }


          this.propertyForm.patchValue(
            {
              permalink:
                this.BASE_PERMALINK
            },
            {
              emitEvent: false
            }
          );

        }
      );


    // -------------------------------------------------------
    // FURNISHING → SHOW INFO CARD TEMPORARILY
    // -------------------------------------------------------

    this.propertyForm
      .get('furnishing')
      ?.valueChanges
      .subscribe((value: string) => {

        if (value) {

          this.showFurnishingCard = true;

          setTimeout(() => {
            this.showFurnishingCard = false;
          }, 3000);

        }

        else {

          this.showFurnishingCard = false;

        }

      });


    // -------------------------------------------------------
    // PRICE → MARKET HEATMAP
    // -------------------------------------------------------

    this.propertyForm
      .get('price')
      ?.valueChanges
      .subscribe(
        (value: any) => {

          this.calculateMarketHeatmap(
            value
          );

        }
      );

  }


  // =========================================================
  // LOAD EXISTING PROPERTY
  // =========================================================

  loadPropertyDataToForm(
    id: string
  ): void {

    console.log(
      '🔎 Loading property:',
      id
    );


    this.propService
      .getPropertyById(id)
      .subscribe({

        next: (property: any) => {

          console.log(
            '📦 Existing property:',
            property
          );


          if (!property) {

            alert(
              'Error: Property record not found.'
            );

            this.router.navigate([
              '/'
            ]);

            return;

          }


          // -------------------------------------------------
          // PATCH MAIN FORM
          // -------------------------------------------------

          this.propertyForm.patchValue({

            id:
              property.id ||
              property._id ||
              '',

            name:
              property.name ||
              '',

            permalink:
              property.permalink ||
              this.BASE_PERMALINK,

            type:
              property.type ||
              'Rent',

            description:
              property.description ||
              '',

            status:
              property.status ||
              'Renting',

            is_featured:
              property.is_featured ??
              false,

            priority:
              property.priority ??
              10,

            uniqueId:
              property.uniqueId ||
              '',

            price:
              property.price ??
              0,

            area:
              property.area ||
              '',

            bhk:
              property.bhk ||
              '1 BHK',

            totalFloors:
              property.totalFloors ??
              '',

            propertyFloor:
              property.propertyFloor ??
              '',

            furnishing:
              property.furnishing ||
              'Unfurnished',

            facing:
              property.facing ||
              'East Facing',

            bathrooms:
              property.bathrooms ??
              '',

            possession:
              property.possession ||
              'Ready to Move',

            rating:
              property.rating ??
              '5',

            latitude:
              property.latitude ??
              12.9698,

            longitude:
              property.longitude ??
              77.7500,

            location:
              property.location ||
              'All Cities'

          });


          // -------------------------------------------------
          // MARKET HEATMAP
          // -------------------------------------------------

          this.calculateMarketHeatmap(
            property.price
          );


          // -------------------------------------------------
          // GALLERY
          // -------------------------------------------------

          if (
            Array.isArray(
              property.gallery
            )
          ) {

            this.uploadedImages =
              property.gallery.map(
                (img: any) => ({

                  url:
                    img.url ||
                    '',

                  isThumbnail:
                    img.main === true ||
                    img.isThumbnail === true

                })
              );

          }


          // -------------------------------------------------
          // AMENITIES
          // -------------------------------------------------

          if (
            Array.isArray(
              property.selectedAmenities
            )
          ) {

            this.amenities.forEach(
              (amenity: any) => {

                amenity.selected =
                  property.selectedAmenities
                    .includes(
                      amenity.name
                    );

              }
            );

          }


          // -------------------------------------------------
          // CATEGORIES
          // -------------------------------------------------

          if (
            Array.isArray(
              property.selectedCategories
            )
          ) {

            this.categories.forEach(
              (category: any) => {

                category.checked =
                  property.selectedCategories
                    .includes(
                      category.name
                    );

              }
            );

          }


          // -------------------------------------------------
          // QUILL
          //
          // Quill is initialized after the view.
          // Use a timeout as a backup.
          // -------------------------------------------------

          setTimeout(
            () => {

              if (
                this.quillInstance &&
                property.description
              ) {

                this.quillInstance.root.innerHTML =
                  property.description;

              }

              this.updateMapPosition();

            },
            300
          );

        },


        error: (error: any) => {

          console.error(
            '❌ Property load error:',
            error
          );

          alert(
            'Unable to load property data.'
          );

          this.router.navigate([
            '/dashboard'
          ]);

        }

      });

  }


  // =========================================================
  // MARKET HEATMAP
  // =========================================================

  calculateMarketHeatmap(
    value: any
  ): void {

    const price =
      Number(value);


    if (
      !price ||
      price < 5000000
    ) {

      this.priceMarketPosition = 20;

    }

    else if (
      price >= 5000000 &&
      price < 15000000
    ) {

      this.priceMarketPosition = 55;

    }

    else {

      this.priceMarketPosition = 85;

    }

  }


  // =========================================================
  // AFTER VIEW INIT
  // =========================================================

  ngAfterViewInit(): void {

    setTimeout(
      () => {

        this.initSmartMap();

        this.initQuill();

      },
      200
    );

  }


  // =========================================================
  // FURNISHING INFORMATION
  // =========================================================

  getFurnishingItems(): string[] {

    const furnishing =
      this.propertyForm?.get('furnishing')?.value;


    switch (furnishing) {

      case 'Fully-Furnished':

        return [
          'Bed',
          'Sofa',
          'Dining Table',
          'Wardrobe',
          'TV Unit',
          'Curtains',
          'Modular Kitchen',
          'Refrigerator',
          'Washing Machine',
          'AC',
          'Lights & Fans'
        ];


      case 'Partially-Furnished':

        return [
          'Wardrobe',
          'Modular Kitchen',
          'Curtains',
          'Lights & Fans',
          'Basic Fixtures'
        ];


      case 'Unfurnished':

        return [
          'Basic Electrical Fixtures',
          'Bathroom Fixtures',
          'Kitchen Platform'
        ];


      default:

        return [];

    }

  }


  // =========================================================
  // QUILL EDITOR
  // =========================================================

  private initQuill(): void {

    if (
      typeof Quill === 'undefined'
    ) {

      console.warn(
        '⚠️ Quill library not found.'
      );

      return;

    }


    const editorElement =
      document.querySelector(
        '#quill-editor'
      );


    if (!editorElement) {

      console.warn(
        '⚠️ #quill-editor not found.'
      );

      return;

    }


    // -------------------------------------------------------
    // CREATE QUILL INSTANCE
    // -------------------------------------------------------

    this.quillInstance =
      new Quill(
        '#quill-editor',
        {

          modules: {

            toolbar:
              '#toolbar'

          },

          theme: 'snow',

          placeholder:
            'Write the property overview, features, and specifications here...'

        }
      );


    // -------------------------------------------------------
    // EXISTING DESCRIPTION
    // -------------------------------------------------------

    const description =
      this.propertyForm
        .get('description')
        ?.value;


    if (description) {

      this.quillInstance.root.innerHTML =
        description;

    }


    // -------------------------------------------------------
    // TEXT CHANGE
    // -------------------------------------------------------

    this.quillInstance.on(
      'text-change',
      () => {

        const html =
          this.quillInstance.root
            .innerHTML;


        this.propertyForm
          .get('description')
          ?.setValue(
            html,
            {
              emitEvent: false
            }
          );

      }
    );

  }


  // =========================================================
  // MAP
  // =========================================================

  private initSmartMap(): void {

    const mapElement =
      document.getElementById(
        'map-container'
      );


    if (
      !mapElement ||
      typeof L === 'undefined'
    ) {

      console.warn(
        '⚠️ Map container or Leaflet is not available.'
      );

      return;

    }


    const lat =
      Number(
        this.propertyForm
          .get('latitude')
          ?.value
      ) ||
      12.9698;


    const lng =
      Number(
        this.propertyForm
          .get('longitude')
          ?.value
      ) ||
      77.7500;


    // -------------------------------------------------------
    // MAP
    // -------------------------------------------------------

    this.map =
      L.map(
        'map-container'
      ).setView(
        [
          lat,
          lng
        ],
        13
      );


    // -------------------------------------------------------
    // OPEN STREET MAP
    // -------------------------------------------------------

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {

        attribution:
          '&copy; OpenStreetMap contributors'

      }
    ).addTo(
      this.map
    );


    // -------------------------------------------------------
    // MARKER
    // -------------------------------------------------------

    this.marker =
      L.marker(
        [
          lat,
          lng
        ],
        {
          draggable: true
        }
      )
      .addTo(
        this.map
      );


    // -------------------------------------------------------
    // MARKER DRAG
    // -------------------------------------------------------

    this.marker.on(
      'dragend',
      (event: any) => {

        const position =
          event.target
            .getLatLng();


        this.propertyForm.patchValue({

          latitude:
            Number(
              position.lat
            ).toFixed(6),

          longitude:
            Number(
              position.lng
            ).toFixed(6)

        });


        this.reverseGeocode(
          position.lat,
          position.lng
        );

      }
    );


    // -------------------------------------------------------
    // MAP REFRESH
    // -------------------------------------------------------

    setTimeout(
      () => {

        if (this.map) {

          this.map.invalidateSize();

        }

      },
      300
    );

  }


  // =========================================================
  // UPDATE MAP AFTER PROPERTY LOAD
  // =========================================================

  private updateMapPosition(): void {

    if (
      !this.map ||
      !this.marker
    ) {

      return;

    }


    const lat =
      Number(
        this.propertyForm
          .get('latitude')
          ?.value
      ) ||
      12.9698;


    const lng =
      Number(
        this.propertyForm
          .get('longitude')
          ?.value
      ) ||
      77.7500;


    const position =
      [
        lat,
        lng
      ];


    this.map.setView(
      position,
      13
    );


    this.marker.setLatLng(
      position
    );


    setTimeout(
      () => {

        this.map.invalidateSize();

      },
      200
    );

  }


  // =========================================================
  // REVERSE GEOCODING
  // =========================================================

  private reverseGeocode(
    lat: number,
    lng: number
  ): void {

    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    )

      .then(
        response =>
          response.json()
      )

      .then(
        data => {

          const address =
            data?.address;


          if (!address) {

            return;

          }


          const area =
            address.suburb ||
            address.neighbourhood ||
            address.residential ||
            address.city_district ||
            address.city ||
            'Bengaluru';


          this.propertyForm.patchValue({

            location:
              area

          });

        }
      )

      .catch(
        error => {

          console.error(
            'Reverse geocoding error:',
            error
          );

        }
      );

  }


  // =========================================================
  // LOCATION SELECT
  // =========================================================

  onLocationSelect(): void {

    const location =
      this.propertyForm
        .get('location')
        ?.value;


    const locationCoordinates: {
      [key: string]: {
        lat: number;
        lng: number;
      }
    } = {

      'All Cities': {
        lat: 12.9716,
        lng: 77.5946
      },

      'Bangalore': {
        lat: 12.9716,
        lng: 77.5946
      },

      'Whitefield': {
        lat: 12.9698,
        lng: 77.7500
      },

      'Hoodi': {
        lat: 13.0012,
        lng: 77.7147
      },

      'Marathahalli': {
        lat: 12.9591,
        lng: 77.6974
      },

      'KR Puram': {
        lat: 13.0098,
        lng: 77.6950
      },

      'Indiranagar': {
        lat: 12.9784,
        lng: 77.6408
      },

      'Electronic City': {
        lat: 12.8452,
        lng: 77.6602
      },

      'Sarjapur Road': {
        lat: 12.9100,
        lng: 77.6870
      },

      'HSR Layout': {
        lat: 12.9116,
        lng: 77.6474
      },

      'Hebbal': {
        lat: 13.0358,
        lng: 77.5970
      },

      'Yelahanka': {
        lat: 13.1007,
        lng: 77.5963
      },

      'Koramangala': {
        lat: 12.9352,
        lng: 77.6245
      }

    };


    const coordinates =
      locationCoordinates[location];


    if (!coordinates) {

      return;

    }


    // Update form coordinates

    this.propertyForm.patchValue({

      latitude:
        coordinates.lat,

      longitude:
        coordinates.lng

    });


    // Update map and marker

    if (
      this.map &&
      this.marker
    ) {

      const position = [
        coordinates.lat,
        coordinates.lng
      ];


      this.map.setView(
        position,
        13
      );


      this.marker.setLatLng(
        position
      );

    }

  }


  // =========================================================
  // AI DESCRIPTION
  // =========================================================

  generateDescriptionWithAI(): void {

    if (!this.propertyForm) {
      return;
    }


    const form =
      this.propertyForm.value;


    if (!form.name) {

      alert(
        'Please enter the property name first.'
      );

      return;

    }


    this.isAiGenerating = true;


    const propertyData = {

      name: form.name,

      type: form.type,

      status: form.status,

      price: form.price,

      area: form.area,

      bhk: form.bhk,

      totalFloors: form.totalFloors,

      propertyFloor: form.propertyFloor,

      furnishing: form.furnishing,

      facing: form.facing,

      bathrooms: form.bathrooms,

      possession: form.possession,

      location: form.location,

      address: form.address,

      city: form.city,

      locality: form.locality,

      subLocality: form.subLocality,

      landmark: form.landmark,

      state: form.state,

      pincode: form.pincode,

      amenities: this.amenities
        .filter(
          (item: any) =>
            item.selected
        )
        .map(
          (item: any) =>
            item.name
        )
        .join(', ')

    };


    this.propService
      .generateAIDescription(propertyData)
      .subscribe({

        next: (response: any) => {

          if (
            response?.success &&
            response?.text
          ) {

            const aiText =
              response.text;


            // Update form description

            this.propertyForm.patchValue({
              description:
                aiText
            });


            // Update Quill editor

            if (this.quillInstance) {

              this.quillInstance.root.innerHTML =
                aiText;

            }

            else {

              const editor =
                document.querySelector(
                  '.ql-editor'
                );

              if (editor) {

                editor.innerHTML =
                  aiText;

              }

            }

          }

          else {

            alert(
              response?.message ||
              'Unable to generate the AI property description.'
            );

          }


          this.isAiGenerating =
            false;

        },


        error: (error: any) => {

          console.error(
            'AI Description Error:',
            error
          );


          alert(
            'Unable to generate the AI property description. Please check the backend.'
          );


          this.isAiGenerating =
            false;

        }

      });

  }


  // =========================================================
  // AMENITY
  // =========================================================

  toggleAmenity(
    id: number
  ): void {

    const item =
      this.amenities.find(
        (amenity: any) =>
          amenity.id === id
      );


    if (item) {

      item.selected =
        !item.selected;

    }

  }


  // =========================================================
  // CATEGORY
  // =========================================================

  onCategoryChange(
    categoryName: string
  ): void {

    const category =
      this.categories.find(
        (item: any) =>
          item.name === categoryName
      );


    if (category) {

      category.checked =
        !category.checked;

    }

  }


  // =========================================================
  // IMAGE UPLOAD → CLOUDINARY
  // =========================================================

  handleProactiveUpload(
    event: any
  ): void {

    console.log(
      '📸 FILE INPUT CHANGED'
    );

    console.log(
      '📸 SELECTED FILES:',
      event?.target?.files
    );


    const files =
      event?.target?.files;


    if (
      !files ||
      files.length === 0
    ) {

      return;

    }


    // -------------------------------------------------------
    // MAXIMUM 10 IMAGES
    // -------------------------------------------------------

    const remainingSlots =
      10 -
      this.uploadedImages.length;


    if (
      remainingSlots <= 0
    ) {

      alert(
        'Maximum 10 images are allowed.'
      );

      return;

    }


    const selectedFiles =
      Array.from(files)
        .slice(
          0,
          remainingSlots
        ) as File[];


    // -------------------------------------------------------
    // VALID IMAGE FILES
    // -------------------------------------------------------

    const validFiles =
      selectedFiles.filter(
        (file: File) =>
          file.type.startsWith('image/')
      );


    if (
      validFiles.length === 0
    ) {

      alert(
        'Please select valid image files.'
      );

      return;

    }


    // -------------------------------------------------------
    // START UPLOAD
    // -------------------------------------------------------

    this.isUploadingImages = true;


    let completedUploads = 0;


    validFiles.forEach(
      (file: File) => {

        const formData =
          new FormData();


        formData.append(
          'image',
          file
        );


        this.http
          .post<any>(
            'https://api.acchasolution.com/api/upload/property-image',
            formData
          )
          .subscribe({

            next:
              (response: any) => {

                if (
                  response?.success &&
                  response?.url
                ) {

                  const isFirstImage =
                    this.uploadedImages.length === 0;


                  this.uploadedImages.push({

                    url:
                      response.url,

                    file:
                      file,

                    isThumbnail:
                      isFirstImage

                  });


                  console.log(
                    '✅ Cloudinary upload successful:',
                    response.url
                  );

                }

                else {

                  console.error(
                    '❌ Cloudinary upload failed:',
                    response
                  );

                }


                completedUploads++;


                if (
                  completedUploads ===
                  validFiles.length
                ) {

                  this.isUploadingImages =
                    false;

                  console.log(
                    '✅ All selected images uploaded successfully.'
                  );

                }

              },


            error:
              (error: any) => {

                console.error(
                  '❌ Cloudinary image upload error:',
                  error
                );


                completedUploads++;


                if (
                  completedUploads ===
                  validFiles.length
                ) {

                  this.isUploadingImages =
                    false;

                }

              }

          });

      }
    );


    // -------------------------------------------------------
    // RESET FILE INPUT
    // -------------------------------------------------------

    if (
      event.target
    ) {

      event.target.value = '';

    }

  }


  // =========================================================
  // SET THUMBNAIL
  // =========================================================

  setThumbnail(
    index: number
  ): void {

    if (
      index < 0 ||
      index >=
        this.uploadedImages.length
    ) {

      return;

    }


    this.uploadedImages.forEach(
      (
        image: any,
        imageIndex: number
      ) => {

        image.isThumbnail =
          imageIndex === index;

      }
    );

  }


  // =========================================================
  // DELETE IMAGE
  // =========================================================

  deleteImage(
    index: number
  ): void {

    if (
      index < 0 ||
      index >=
        this.uploadedImages.length
    ) {

      return;

    }


    const deletingThumbnail =
      this.uploadedImages[index]
        ?.isThumbnail;


    this.uploadedImages.splice(
      index,
      1
    );


    // -------------------------------------------------------
    // ALWAYS KEEP ONE MAIN PHOTO
    // -------------------------------------------------------

    if (
      this.uploadedImages.length > 0 &&
      (
        deletingThumbnail ||
        !this.uploadedImages.some(
          (image: any) =>
            image.isThumbnail
        )
      )
    ) {

      this.uploadedImages[0]
        .isThumbnail = true;

    }

  }


  // =========================================================
  // GENERATE SYSTEM ID
  // =========================================================

  generateNewId(): void {

    if (
      !this.propertyForm
    ) {

      return;

    }


    const id =
      'PROP-' +
      Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();


    this.propertyForm
      .get('uniqueId')
      ?.setValue(id);


    if (
      typeof navigator !==
      'undefined' &&
      navigator.vibrate
    ) {

      navigator.vibrate(10);

    }

  }


  // =========================================================
  // COPY PERMALINK
  // =========================================================

  copyPermalink(): void {

    const fullUrl =
      this.propertyForm
        .get('permalink')
        ?.value;


    if (!fullUrl) {

      return;

    }


    if (
      navigator.clipboard
    ) {

      navigator.clipboard
        .writeText(
          fullUrl
        )

        .then(
          () => {

            alert(
              'Link copied to clipboard! ✅'
            );

          }
        )

        .catch(
          () => {

            alert(
              'Unable to copy the link.'
            );

          }
        );

    }

  }


  // =========================================================
  // SELECT LINK
  // =========================================================

  selectLink(
    event: any
  ): void {

    event?.target?.select();

  }


  // =========================================================
  // RESET FORM
  // =========================================================

  resetForm(): void {

    this.isEditMode = false;

    this.editingPropertyId = null;


    this.propertyForm.reset({

      id: '',

      name: '',

      permalink:
        this.BASE_PERMALINK,

      type:
        'Rent',

      description:
        '',

      status:
        'Renting',

      is_featured:
        false,

      priority:
        10,

      uniqueId:
        '',

      price:
        0,

      area:
        '',

      bhk:
        '1 BHK',

      totalFloors:
        '',

      propertyFloor:
        '',

      furnishing:
        'Unfurnished',

      facing:
        'East Facing',

      bathrooms:
        '',

      possession:
        'Ready to Move',

      rating:
        '5',

      latitude:
        12.9698,

      longitude:
        77.7500,

      location:
        'All Cities'

    });


    this.uploadedImages = [];


    this.amenities.forEach(
      (amenity: any) => {

        amenity.selected =
          false;

      }
    );


    this.categories.forEach(
      (category: any) => {

        category.checked =
          category.name ===
          'Commercial';

      }
    );


    this.generateNewId();


    // -------------------------------------------------------
    // CLEAR QUILL
    // -------------------------------------------------------

    if (
      this.quillInstance
    ) {

      this.quillInstance.root.innerHTML =
        '';

    }


    // -------------------------------------------------------
    // RESET MAP
    // -------------------------------------------------------

    if (
      this.map &&
      this.marker
    ) {

      const position = [
        12.9698,
        77.7500
      ];


      this.map.setView(
        position,
        13
      );


      this.marker.setLatLng(
        position
      );

    }


    this.priceMarketPosition =
      20;

  }


  // =========================================================
  // FORM ERROR
  // =========================================================

  showError(
    controlName: string
  ): boolean {

    const control =
      this.propertyForm
        ?.get(controlName);


    return !!(
      control &&
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );

  }


  // =========================================================
  // SUBMIT
  // =========================================================

  onSubmit(): void {

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (
      this.propertyForm.invalid
    ) {

      this.propertyForm.markAllAsTouched();

      alert(
        'Please fill out all required fields highlighted with an asterisk.'
      );

      return;

    }


    // -------------------------------------------------------
    // WAIT FOR IMAGE UPLOAD
    // -------------------------------------------------------

    if (
      this.isUploadingImages
    ) {

      alert(
        'Please wait. Property images are still uploading.'
      );

      return;

    }


    // -------------------------------------------------------
    // GET DESCRIPTION FROM QUILL
    // -------------------------------------------------------

    if (
      this.quillInstance
    ) {

      this.propertyForm
        .get('description')
        ?.setValue(
          this.quillInstance.root.innerHTML,
          {
            emitEvent: false
          }
        );

    }


    // -------------------------------------------------------
    // CREATE FINAL PAYLOAD
    // -------------------------------------------------------

const formValue = this.propertyForm.value;

// =========================================================
// LOGGED-IN USER / AGENT DETAILS
// =========================================================

const loggedInUser = this.authService.getUser();

console.log('👤 LOGGED-IN USER:', loggedInUser);
console.log('👤 USER NAME:', loggedInUser?.name);
console.log('👤 USER EMAIL:', loggedInUser?.email);

const postedById =
  loggedInUser?._id ||
  loggedInUser?.id ||
  loggedInUser?.uniqueId ||
  '';

const postedByName =
  loggedInUser?.name ||
  this.authService.getUserName() ||
  '';

const postedByEmail =
  loggedInUser?.email ||
  this.authService.getUserEmail() ||
  '';

// =========================================================
// FINAL PROPERTY PAYLOAD
// =========================================================



const compiledPayload = {

  ...formValue,

  // =======================================================
  // LOGGED-IN USER / AGENT DETAILS
  // =======================================================

  postedById:
    postedById,

  postedByName:
    postedByName,

  postedByEmail:
    postedByEmail,

  priceAnalysis:
    this.priceMarketPosition,

  selectedAmenities:
    this.amenities
      .filter(
        (amenity: any) =>
          amenity.selected
      )
      .map(
        (amenity: any) =>
          amenity.name
      ),

  selectedCategories:
    this.categories
      .filter(
        (category: any) =>
          category.checked
      )
      .map(
        (category: any) =>
          category.name
      ),

  gallery:
    this.uploadedImages.map(
      (image: any) => ({

        url:
          image.url,

        main:
          image.isThumbnail === true

      })
    )

};

    console.log(
      '📤 FINAL PROPERTY PAYLOAD:',
      compiledPayload
    );


    // =======================================================
    // EDIT → UPDATE EXISTING RECORD
    // =======================================================

    if (
      this.isEditMode &&
      this.editingPropertyId
    ) {

      console.log(
        '✏️ UPDATING PROPERTY:',
        this.editingPropertyId
      );


      this.propService
        .updateProperty(
          this.editingPropertyId,
          compiledPayload
        )

        .subscribe({

          next:
            (response: any) => {

              console.log(
                '✅ PROPERTY UPDATED:',
                response
              );


              alert(
                'Property successfully updated on AcchaSolution! 🚀'
              );


              // ---------------------------------------------
              // AFTER UPDATE → HOME → CURATED PROPERTIES
              // ---------------------------------------------

              this.router
                .navigateByUrl('/home')
                .then(() => {

                  setTimeout(() => {

                    const curatedSection =
                      document.getElementById(
                        'curated-properties'
                      );


                    if (curatedSection) {

                      curatedSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });

                    }

                  }, 300);

                });

            },


          error:
            (error: any) => {

              console.error(
                '❌ UPDATE ERROR:',
                error
              );


              alert(
                'Database update error. The property could not be updated.'
              );

            }

        });


      return;

    }


    // =======================================================
    // NEW → CREATE
    // =======================================================

    console.log(
      '🆕 CREATING NEW PROPERTY'
    );


    this.propService
      .addProperty(
        compiledPayload
      )

      .subscribe({

        next:
          (response: any) => {

            console.log(
              '✅ PROPERTY CREATED:',
              response
            );


            alert(
              'Property successfully listed! 🚀'
            );


            // ---------------------------------------------
            // AFTER CREATE → HOME → CURATED PROPERTIES
            // ---------------------------------------------

            this.router
              .navigateByUrl('/home')
              .then(() => {

                setTimeout(() => {

                  const curatedSection =
                    document.getElementById(
                      'curated-properties'
                    );


                  if (curatedSection) {

                    curatedSection.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });

                  }

                }, 300);

              });

          },


        error:
          (error: any) => {

            console.error(
              '❌ CREATE ERROR:',
              error
            );


            alert(
              'Database submission error.'
            );

          }

      });

  }


  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    if (
      this.map
    ) {

      this.map.remove();

      this.map = null;

      this.marker = null;

    }


    this.quillInstance =
      null;

  }


  // =========================================================
  // SELECT ALL AMENITIES
  // =========================================================

  selectAllAmenities(): void {

    const allSelected =
      this.amenities.every(
        a => a.selected
      );


    this.amenities.forEach(
      a => {

        a.selected =
          !allSelected;

      }
    );

  }

}
