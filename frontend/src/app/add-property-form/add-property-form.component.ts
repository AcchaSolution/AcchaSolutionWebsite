import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { HttpClient } from '@angular/common/http';

import { PropertyService } from '../services/property.service';

import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

declare var Quill: any;
declare var L: any;


@Component({
  selector: 'app-add-property-form',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],

  templateUrl: './add-property-form.component.html',

  styleUrl: './add-property-form.component.css'
})


export class AddPropertyFormComponent
  implements OnInit, AfterViewInit, OnDestroy {


  // =========================================================
  // FORM
  // =========================================================

  propertyForm!: FormGroup;


  // =========================================================
  // EDITOR
  // =========================================================

  public Editor: any = ClassicEditor;

  quillInstance: any = null;


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
  // EDIT MODE
  // =========================================================

  isEditMode = false;

  editingPropertyId: string | null = null;


  // =========================================================
  // AI
  // =========================================================

  isAiGenerating = false;


  // =========================================================
  // MARKET PRICE
  // =========================================================

  priceMarketPosition = 65;


  // =========================================================
  // BASE PERMALINK
  // =========================================================

  private readonly BASE_PERMALINK =
    'http://localhost:4200/properties/';


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
      name: 'Smart Home Hub',
      icon: 'hub',
      selected: false
    },

    {
      id: 3,
      name: 'EV Charging',
      icon: 'ev_station',
      selected: false
    },

    {
      id: 4,
      name: 'Private Garden',
      icon: 'yard',
      selected: false
    },

    {
      id: 5,
      name: 'Gym/Yoga Studio',
      icon: 'fitness_center',
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
  // KNOWN LOCATIONS
  // =========================================================

  private readonly knownLocations = [

    'Whitefield',

    'Hoodi',

    'Marathahalli',

    'KR Puram',

    'Indiranagar',

    'Electronic City',

    'Sarjapur Road',

    'HSR Layout',

    'Hebbal',

    'Yelahanka',

    'Koramangala'

  ];


  // =========================================================
  // LOCATION COORDINATES
  // =========================================================

  private locationCoordinates: {
    [key: string]: {
      lat: number;
      lng: number;
    }
  } = {

    'Whitefield': {
      lat: 12.9698,
      lng: 77.7500
    },

    'Hoodi': {
      lat: 12.9916,
      lng: 77.7150
    },

    'Marathahalli': {
      lat: 12.9591,
      lng: 77.6974
    },

    'KR Puram': {
      lat: 13.0078,
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
      lng: 77.6389
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


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(

    private fb: FormBuilder,

    private propService: PropertyService,

    private router: Router,

    private route: ActivatedRoute,

    private http: HttpClient

  ) {}


  // =========================================================
  // ON INIT
  // =========================================================

  ngOnInit(): void {

    // =======================================================
    // FORM
    // =======================================================

    this.propertyForm = this.fb.group({

      // -----------------------------------------------------
      // BASIC
      // -----------------------------------------------------

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

      type: ['Rent'],

      description: [''],

      status: ['Renting'],

      is_featured: [false],

      priority: [
        10,
        [
          Validators.min(1),
          Validators.max(100)
        ]
      ],

      uniqueId: [''],


      // -----------------------------------------------------
      // PRICE / PROPERTY
      // -----------------------------------------------------

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

      bhk: ['1 BHK'],

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

      furnishing: ['Unfurnished'],

      facing: ['East Facing'],

      bathrooms: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      possession: ['Ready to Move'],


      // -----------------------------------------------------
      // LOCATION
      // -----------------------------------------------------

      location: [
        'Whitefield',
        Validators.required
      ],

      customLocation: [''],

      address: [
        '',
        Validators.required
      ],

      city: [
        'Bengaluru',
        Validators.required
      ],

      locality: [
        'Whitefield',
        Validators.required
      ],

      subLocality: [''],

      landmark: [''],

      state: ['Karnataka'],

      pincode: [''],


      // -----------------------------------------------------
      // COORDINATES
      // -----------------------------------------------------

      latitude: [12.9698],

      longitude: [77.7500],


      // -----------------------------------------------------
      // RATING
      // -----------------------------------------------------

      rating: ['']

    });


    // =======================================================
    // SYSTEM ID
    // =======================================================

    this.generateNewId();


    // =======================================================
    // EDIT MODE
    // =======================================================

    const urlId =
      this.route.snapshot.paramMap.get('id');


    if (urlId) {

      this.isEditMode = true;

      this.editingPropertyId = urlId;

      this.loadPropertyDataToForm(urlId);

    }


    // =======================================================
    // PROPERTY NAME → PERMALINK
    // =======================================================

    this.propertyForm
      .get('name')
      ?.valueChanges
      .subscribe(nameValue => {

        if (!nameValue) {

          if (!this.isEditMode) {

            this.propertyForm.patchValue(
              {
                permalink: this.BASE_PERMALINK
              },
              {
                emitEvent: false
              }
            );

          }

          return;

        }


        const slug = nameValue

          .toLowerCase()

          .trim()

          .replace(/\s+/g, '-')

          .replace(/[^a-z0-9-]/g, '');


        const fullGeneratedUrl =
          `${this.BASE_PERMALINK}${slug}`;


        this.propertyForm.patchValue(
          {
            permalink: fullGeneratedUrl
          },
          {
            emitEvent: false
          }
        );

      });


    // =======================================================
    // PERMALINK PROTECTION
    // =======================================================

    this.propertyForm
      .get('permalink')
      ?.valueChanges
      .subscribe(currentUrl => {

        if (!currentUrl) {

          return;

        }

        if (
          !currentUrl.startsWith(
            this.BASE_PERMALINK
          )
        ) {

          this.propertyForm.patchValue(
            {
              permalink: this.BASE_PERMALINK
            },
            {
              emitEvent: false
            }
          );

        }

      });


    // =======================================================
    // PRICE HEATMAP
    // =======================================================

    this.propertyForm
      .get('price')
      ?.valueChanges
      .subscribe(value => {

        this.calculateMarketHeatmap(value);

      });


    /*
     * IMPORTANT LOCATION FIX
     *
     * Yahan pehle locality/city ke valueChanges se
     * location ko automatically overwrite kiya ja raha tha.
     *
     * Isi wajah se dropdown mein Whitefield/locality
     * baar-baar aa raha tha.
     *
     * Ab hum location ko locality/city se overwrite nahi karenge.
     */

  }


  // =========================================================
  // LOCATION SELECT
  // =========================================================

  onLocationSelect(): void {

    const selectedLocation =
      this.propertyForm.get('location')?.value;


    // -------------------------------------------------------
    // OTHER
    // -------------------------------------------------------

    if (selectedLocation === 'Other') {

      this.propertyForm.patchValue(
        {
          customLocation: ''
        },
        {
          emitEvent: false
        }
      );

      return;

    }


    // -------------------------------------------------------
    // KNOWN LOCATION
    // -------------------------------------------------------

    const coordinates =
      this.locationCoordinates[selectedLocation];


    if (coordinates) {

      this.propertyForm.patchValue(
        {
          locality: selectedLocation,
          customLocation: ''
        },
        {
          emitEvent: false
        }
      );


      // Move map

      if (this.map) {

        this.map.setView(
          [
            coordinates.lat,
            coordinates.lng
          ],
          15
        );

      }


      // Move marker

      if (this.marker) {

        this.marker.setLatLng(
          [
            coordinates.lat,
            coordinates.lng
          ]
        );

      }


      // Update coordinates

      this.propertyForm.patchValue(
        {
          latitude: coordinates.lat,
          longitude: coordinates.lng
        },
        {
          emitEvent: false
        }
      );

    }

  }


  // =========================================================
  // GET FINAL LOCATION
  // =========================================================

  private getFinalLocation(): string {

    const selectedLocation =
      this.propertyForm.get('location')?.value;


    if (selectedLocation === 'Other') {

      return (
        this.propertyForm
          .get('customLocation')
          ?.value
          ?.trim() || 'Other'
      );

    }


    return selectedLocation || 'Whitefield';

  }


  // =========================================================
  // AFTER VIEW INIT
  // =========================================================

  ngAfterViewInit(): void {

    setTimeout(() => {

      this.initSmartMap();

      this.initQuill();

    }, 500);

  }


  // =========================================================
  // QUILL
  // =========================================================

  private initQuill(): void {

    if (typeof Quill === 'undefined') {

      console.warn(
        'Quill library is not loaded.'
      );

      return;

    }


    const editorElement =
      document.querySelector(
        '#quill-editor'
      );


    if (!editorElement) {

      console.warn(
        'Quill editor element not found.'
      );

      return;

    }


    if (this.quillInstance) {

      return;

    }


    this.quillInstance =
      new Quill(
        '#quill-editor',
        {

          modules: {

            toolbar: '#toolbar'

          },

          theme: 'snow',

          placeholder:
            'Property overview, specifications, features aur description yahan likhein...'

        }
      );


    const currentDesc =
      this.propertyForm
        .get('description')
        ?.value;


    if (currentDesc) {

      this.quillInstance.root.innerHTML =
        currentDesc;

    }


    this.quillInstance.on(
      'text-change',
      () => {

        const html =
          this.quillInstance.root.innerHTML;


        this.propertyForm
          .get('description')
          ?.setValue(html);

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


    if (!mapElement) {

      console.error(
        'Map container not found'
      );

      return;

    }


    if (typeof L === 'undefined') {

      console.error(
        'Leaflet is not loaded'
      );

      return;

    }


    if (this.map) {

      this.map.remove();

      this.map = null;

      this.marker = null;

    }


    const lat =
      Number(
        this.propertyForm
          .get('latitude')
          ?.value
      ) || 12.9698;


    const lng =
      Number(
        this.propertyForm
          .get('longitude')
          ?.value
      ) || 77.7500;


    this.map =
      L.map(
        'map-container'
      ).setView(
        [lat, lng],
        14
      );


    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '&copy; OpenStreetMap contributors'
      }
    ).addTo(this.map);


    this.marker =
      L.marker(
        [lat, lng],
        {
          draggable: true
        }
      ).addTo(this.map);


    this.marker.bindPopup(
      '📍 Drag me to set property location'
    );


    this.marker.on(
      'dragend',
      (event: any) => {

        const position =
          event.target.getLatLng();


        const newLat =
          Number(
            position.lat.toFixed(6)
          );


        const newLng =
          Number(
            position.lng.toFixed(6)
          );


        this.propertyForm.patchValue(
          {
            latitude: newLat,
            longitude: newLng
          },
          {
            emitEvent: false
          }
        );


        this.reverseGeocode(
          newLat,
          newLng
        );

      }
    );


    setTimeout(() => {

      if (this.map) {

        this.map.invalidateSize();

      }

    }, 500);

  }


  // =========================================================
  // REVERSE GEOCODING
  // =========================================================

  private reverseGeocode(
    lat: number,
    lng: number
  ): void {

    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=json` +
      `&lat=${lat}` +
      `&lon=${lng}` +
      `&zoom=18` +
      `&addressdetails=1`;


    fetch(
      url,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

      .then(response => {

        if (!response.ok) {

          throw new Error(
            'Address service failed'
          );

        }

        return response.json();

      })

      .then(data => {

        console.log(
          'MAP ADDRESS:',
          data
        );


        const addr =
          data?.address || {};


        const fullAddress =
          data?.display_name || '';


        const locality =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.city_district ||
          '';


        const city =
          addr.city ||
          addr.town ||
          addr.municipality ||
          addr.village ||
          'Bengaluru';


        const state =
          addr.state ||
          'Karnataka';


        const pincode =
          addr.postcode ||
          '';


        // ---------------------------------------------------
        // FIND KNOWN LOCATION
        // ---------------------------------------------------

        const matchedLocation =
          this.knownLocations.find(
            item =>
              fullAddress
                .toLowerCase()
                .includes(
                  item.toLowerCase()
                )
          );


        // ---------------------------------------------------
        // LOCATION DATA
        // ---------------------------------------------------

        if (matchedLocation) {

          this.propertyForm.patchValue(
            {
              location:
                matchedLocation,

              customLocation: '',

              address:
                fullAddress,

              locality:
                matchedLocation,

              city:
                city,

              state:
                state,

              pincode:
                pincode,

              latitude:
                Number(
                  lat.toFixed(6)
                ),

              longitude:
                Number(
                  lng.toFixed(6)
                )
            },
            {
              emitEvent: false
            }
          );

        }

        else {

          this.propertyForm.patchValue(
            {
              location: 'Other',

              customLocation:
                locality ||
                city ||
                fullAddress,

              address:
                fullAddress,

              locality:
                locality,

              city:
                city,

              state:
                state,

              pincode:
                pincode,

              latitude:
                Number(
                  lat.toFixed(6)
                ),

              longitude:
                Number(
                  lng.toFixed(6)
                )
            },
            {
              emitEvent: false
            }
          );

        }


        // ---------------------------------------------------
        // POPUP
        // ---------------------------------------------------

        if (this.marker) {

          this.marker
            .bindPopup(
              `
              <div style="font-size:13px;">
                <strong>
                  📍 Property Location
                </strong>

                <br><br>

                ${
                  fullAddress ||
                  locality ||
                  city
                }

              </div>
              `
            )
            .openPopup();

        }

      })

      .catch(error => {

        console.error(
          'Reverse geocoding error:',
          error
        );

        alert(
          'Address could not be detected from this location.'
        );

      });

  }


  // =========================================================
  // SEARCH LOCATION
  // =========================================================

  searchLocation(): void {

    const searchText =
      this.propertyForm
        .get('address')
        ?.value;


    if (
      !searchText ||
      searchText.trim().length < 3
    ) {

      alert(
        'Please enter a location or address first.'
      );

      return;

    }


    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?format=json` +
      `&q=${encodeURIComponent(
        searchText
      )}` +
      `&limit=1` +
      `&addressdetails=1`;


    fetch(
      url,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

      .then(response => {

        if (!response.ok) {

          throw new Error(
            'Location search failed'
          );

        }

        return response.json();

      })

      .then(results => {

        if (
          !results ||
          results.length === 0
        ) {

          alert(
            'Location not found. Please try another address.'
          );

          return;

        }


        const result =
          results[0];


        const lat =
          Number(
            result.lat
          );


        const lng =
          Number(
            result.lon
          );


        const resultAddress =
          result.address || {};


        const city =
          resultAddress.city ||
          resultAddress.town ||
          resultAddress.municipality ||
          resultAddress.village ||
          'Bengaluru';


        const locality =
          resultAddress.suburb ||
          resultAddress.neighbourhood ||
          resultAddress.residential ||
          resultAddress.city_district ||
          '';


        const state =
          resultAddress.state ||
          'Karnataka';


        const pincode =
          resultAddress.postcode ||
          '';


        const fullAddress =
          result.display_name ||
          '';


        // ---------------------------------------------------
        // FIND KNOWN LOCATION
        // ---------------------------------------------------

        const matchedLocation =
          this.knownLocations.find(
            item =>
              fullAddress
                .toLowerCase()
                .includes(
                  item.toLowerCase()
                )
          );


        // ---------------------------------------------------
        // UPDATE LOCATION
        // ---------------------------------------------------

        if (matchedLocation) {

          this.propertyForm.patchValue(
            {

              location:
                matchedLocation,

              customLocation: '',

              latitude:
                Number(
                  lat.toFixed(6)
                ),

              longitude:
                Number(
                  lng.toFixed(6)
                ),

              address:
                fullAddress,

              city:
                city,

              locality:
                matchedLocation,

              state:
                state,

              pincode:
                pincode

            },
            {
              emitEvent: false
            }
          );

        }

        else {

          this.propertyForm.patchValue(
            {

              location:
                'Other',

              customLocation:
                locality ||
                city ||
                fullAddress,

              latitude:
                Number(
                  lat.toFixed(6)
                ),

              longitude:
                Number(
                  lng.toFixed(6)
                ),

              address:
                fullAddress,

              city:
                city,

              locality:
                locality,

              state:
                state,

              pincode:
                pincode

            },
            {
              emitEvent: false
            }
          );

        }


        // ---------------------------------------------------
        // MOVE MAP
        // ---------------------------------------------------

        if (this.map) {

          this.map.setView(
            [lat, lng],
            16
          );

        }


        // ---------------------------------------------------
        // MOVE MARKER
        // ---------------------------------------------------

        if (this.marker) {

          this.marker.setLatLng(
            [lat, lng]
          );

        }

      })

      .catch(error => {

        console.error(
          'Location search error:',
          error
        );

        alert(
          'Location search failed. Please check your internet connection.'
        );

      });

  }


  // =========================================================
  // CURRENT LOCATION
  // =========================================================

  useCurrentLocation(): void {

    if (
      !navigator.geolocation
    ) {

      alert(
        'Your browser does not support location detection.'
      );

      return;

    }


    navigator.geolocation.getCurrentPosition(

      position => {

        const lat =
          position.coords.latitude;


        const lng =
          position.coords.longitude;


        this.propertyForm.patchValue(
          {

            latitude:
              Number(
                lat.toFixed(6)
              ),

            longitude:
              Number(
                lng.toFixed(6)
              )

          },
          {
            emitEvent: false
          }
        );


        if (this.map) {

          this.map.setView(
            [lat, lng],
            16
          );

        }


        if (this.marker) {

          this.marker.setLatLng(
            [lat, lng]
          );

        }


        this.reverseGeocode(
          lat,
          lng
        );

      },


      error => {

        console.error(
          'Geolocation error:',
          error
        );


        alert(
          'Unable to access your current location. Please allow location permission.'
        );

      },


      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }

    );

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

      this.priceMarketPosition =
        20;

    }

    else if (
      price >= 5000000 &&
      price < 15000000
    ) {

      this.priceMarketPosition =
        55;

    }

    else {

      this.priceMarketPosition =
        85;

    }

  }


  // =========================================================
  // AMENITY
  // =========================================================

  toggleAmenity(
    id: number
  ): void {

    const item =
      this.amenities.find(
        a => a.id === id
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
    catName: string
  ): void {

    const category =
      this.categories.find(
        c => c.name === catName
      );


    if (category) {

      category.checked =
        !category.checked;

    }

  }


  // =========================================================
  // IMAGE UPLOAD
  // =========================================================

  handleProactiveUpload(
    event: any
  ): void {

    const files =
      event.target.files;


    if (
      !files ||
      files.length === 0
    ) {

      return;

    }


    const remaining =
      10 -
      this.uploadedImages.length;


    if (remaining <= 0) {

      alert(
        'Maximum 10 images are allowed.'
      );

      return;

    }


    const filesToUpload =
      Array.from(files)
        .slice(
          0,
          remaining
        ) as File[];


    filesToUpload.forEach(
      (file: File) => {

        if (
          !file.type.startsWith(
            'image/'
          )
        ) {

          return;

        }


        const reader =
          new FileReader();


        reader.onload =
          (e: any) => {

            this.uploadedImages.push(
              {

                url:
                  e.target.result,

                file:
                  file,

                isThumbnail:
                  this.uploadedImages.length === 0

              }
            );

          };


        reader.readAsDataURL(
          file
        );

      }
    );


    event.target.value = '';

  }


  // =========================================================
  // SET THUMBNAIL
  // =========================================================

  setThumbnail(
    index: number
  ): void {

    this.uploadedImages.forEach(
      (image, i) => {

        image.isThumbnail =
          i === index;

      }
    );

  }


  // =========================================================
  // DELETE IMAGE
  // =========================================================

  deleteImage(
    index: number
  ): void {

    this.uploadedImages.splice(
      index,
      1
    );


    if (
      this.uploadedImages.length > 0 &&
      !this.uploadedImages.some(
        image =>
          image.isThumbnail
      )
    ) {

      this.uploadedImages[0]
        .isThumbnail = true;

    }

  }


  // =========================================================
  // GENERATE ID
  // =========================================================

  generateNewId(): void {

    const id =
      'PROP-' +
      Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();


    this.propertyForm
      ?.get('uniqueId')
      ?.setValue(id);


    if (
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


    navigator.clipboard
      .writeText(fullUrl)

      .then(() => {

        alert(
          'Link copied to clipboard! ✅'
        );

      })

      .catch(() => {

        alert(
          'Unable to copy link.'
        );

      });

  }


  // =========================================================
  // SELECT LINK
  // =========================================================

  selectLink(
    event: any
  ): void {

    event.target.select();

  }


  // =========================================================
  // RESET FORM
  // =========================================================

  resetForm(): void {

    this.propertyForm.reset(

      {

        id: '',

        name: '',

        permalink:
          this.BASE_PERMALINK,

        type: 'Rent',

        description: '',

        status: 'Renting',

        is_featured: false,

        priority: 10,

        uniqueId: '',

        price: 0,

        area: '',

        bhk: '1 BHK',

        totalFloors: '',

        propertyFloor: '',

        furnishing: 'Unfurnished',

        facing: 'East Facing',

        bathrooms: '',

        possession: 'Ready to Move',


        location:
          'Whitefield',

        customLocation:
          '',

        address: '',

        city:
          'Bengaluru',

        locality:
          'Whitefield',

        subLocality: '',

        landmark: '',

        state:
          'Karnataka',

        pincode: '',


        latitude:
          12.9698,

        longitude:
          77.7500,


        rating: ''

      }

    );


    this.uploadedImages = [];


    this.amenities.forEach(
      item =>
        item.selected = false
    );


    this.categories.forEach(
      category => {

        category.checked =
          category.name === 'Commercial';

      }
    );


    if (this.quillInstance) {

      this.quillInstance.root.innerHTML =
        '';

    }


    if (
      this.map &&
      this.marker
    ) {

      this.map.setView(
        [
          12.9698,
          77.7500
        ],
        13
      );


      this.marker.setLatLng(
        [
          12.9698,
          77.7500
        ]
      );

    }


    this.priceMarketPosition =
      20;


    this.generateNewId();

  }


  // =========================================================
  // LOAD PROPERTY FOR EDIT
  // =========================================================

  loadPropertyDataToForm(
    id: string
  ): void {

    this.propService
      .getPropertyById(id)
      .subscribe({

        next: (property: any) => {

          if (!property) {

            alert(
              'Error: Property record not found.'
            );


            this.router.navigate(
              ['/dashboard']
            );


            return;

          }


          // -------------------------------------------------
          // LOCATION COMPATIBILITY
          // -------------------------------------------------

          let savedLocation =
            property.location ||
            'Whitefield';


          let savedCustomLocation =
            property.customLocation ||
            '';


          /*
           * Agar old property mein location kuch aisa
           * saved hai:
           *
           * Whitefield, Bengaluru
           *
           * to dropdown mein direct match nahi milega.
           *
           * Isliye known location check kar rahe hain.
           */

          const matchedLocation =
            this.knownLocations.find(
              item =>
                savedLocation
                  .toLowerCase()
                  .includes(
                    item.toLowerCase()
                  )
            );


          if (matchedLocation) {

            savedLocation =
              matchedLocation;

            savedCustomLocation =
              '';

          }

          else if (
            !this.knownLocations.includes(
              savedLocation
            )
          ) {

            savedCustomLocation =
              savedCustomLocation ||
              savedLocation;

            savedLocation =
              'Other';

          }


          // -------------------------------------------------
          // FORM DATA
          // -------------------------------------------------

          this.propertyForm.patchValue(
            {

              ...property,

              location:
                savedLocation,

              customLocation:
                savedCustomLocation

            },
            {
              emitEvent: false
            }
          );


          // -------------------------------------------------
          // PRICE
          // -------------------------------------------------

          this.calculateMarketHeatmap(
            property.price
          );


          // -------------------------------------------------
          // GALLERY
          // -------------------------------------------------

          if (
            property.gallery &&
            Array.isArray(
              property.gallery
            )
          ) {

            this.uploadedImages =
              property.gallery.map(
                (image: any) => ({

                  url:
                    image.url,

                  isThumbnail:
                    image.main

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
              amenity => {

                amenity.selected =
                  property
                    .selectedAmenities
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
              category => {

                category.checked =
                  property
                    .selectedCategories
                    .includes(
                      category.name
                    );

              }
            );

          }


          // -------------------------------------------------
          // QUILL + MAP
          // -------------------------------------------------

          setTimeout(() => {

            if (
              this.quillInstance &&
              property.description
            ) {

              this.quillInstance.root.innerHTML =
                property.description;

            }


            if (
              this.map &&
              this.marker
            ) {

              const lat =
                Number(
                  property.latitude
                ) || 12.9698;


              const lng =
                Number(
                  property.longitude
                ) || 77.7500;


              this.map.setView(
                [lat, lng],
                15
              );


              this.marker.setLatLng(
                [lat, lng]
              );


              this.map.invalidateSize();

            }

          }, 500);

        },


        error: (error) => {

          console.error(
            'Load property error:',
            error
          );


          alert(
            'Unable to load property data.'
          );

        }

      });

  }


  // =========================================================
  // SUBMIT
  // =========================================================

  onSubmit(): void {

if (this.propertyForm.invalid) {

  this.propertyForm.markAllAsTouched();

  const firstInvalidControl =
    document.querySelector(
      '.ng-invalid[formControlName]'
    ) as HTMLElement;

  if (firstInvalidControl) {

    firstInvalidControl.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    setTimeout(() => {
      firstInvalidControl.focus();
    }, 300);

  }

  return;
}

    // =======================================================
    // LOGGED USER
    // =======================================================

    let storedUser: any = null;


    try {

      storedUser =
        JSON.parse(
          localStorage.getItem(
            'user'
          ) || 'null'
        );

    }

    catch {

      storedUser = null;

    }


    // =======================================================
    // FINAL LOCATION
    // =======================================================

    const finalLocation =
      this.getFinalLocation();


    // =======================================================
    // PAYLOAD
    // =======================================================

    const compiledPayload = {

      ...this.propertyForm.value,


      // IMPORTANT:
      // Final location yahan save hogi.

      location:
        finalLocation,


      postedById:
        storedUser?.id ||
        storedUser?._id ||
        '',


      postedByEmail:
        storedUser?.email ||
        localStorage.getItem(
          'userEmail'
        ) ||
        '',


      postedByName:
        storedUser?.name ||
        localStorage.getItem(
          'userName'
        ) ||
        '',


      priceAnalysis:
        this.priceMarketPosition,


      selectedAmenities:

        this.amenities

          .filter(
            item =>
              item.selected
          )

          .map(
            item =>
              item.name
          ),


      selectedCategories:

        this.categories

          .filter(
            category =>
              category.checked
          )

          .map(
            category =>
              category.name
          ),


      gallery:

        this.uploadedImages.map(
          image => ({

            url:
              image.url,

            main:
              image.isThumbnail

          })
        )

    };


    console.log(
      'PROPERTY PAYLOAD:',
      compiledPayload
    );


    // =======================================================
    // EDIT
    // =======================================================

    if (
      this.isEditMode &&
      this.editingPropertyId
    ) {

      this.propService
        .deleteProperty(
          this.editingPropertyId
        )
        .subscribe({

          next: () => {

            this.saveDataDirectlyToService(
              compiledPayload
            );

          },


          error: (error) => {

            console.error(
              'Delete old property error:',
              error
            );


            alert(
              'Unable to update old property record.'
            );

          }

        });

    }


    // =======================================================
    // NEW PROPERTY
    // =======================================================

    else {

      this.saveDataDirectlyToService(
        compiledPayload
      );

    }

  }


  // =========================================================
  // SAVE SERVICE
  // =========================================================

  private saveDataDirectlyToService(
    payload: any
  ): void {

    this.propService
      .addProperty(payload)
      .subscribe({

        next: () => {

          alert(

            this.isEditMode

              ? 'Property Successfully Updated on AcchaSolution! 🚀'

              : 'Property Successfully Listed! 🚀'

          );


          this.router.navigateByUrl(
            '/home'
          );

        },


        error: (error: any) => {

          console.error(
            'Property save error:',
            error
          );


          alert(
            'Database submission error.'
          );

        }

      });

  }


  // =========================================================
  // AI DESCRIPTION
  // =========================================================

  generateDescriptionWithAI(): void {

    const currentFormValues =
      this.propertyForm.value;


    if (
      !currentFormValues.name ||
      currentFormValues.name.trim().length < 3
    ) {

      alert(
        'Please enter Property Name first (minimum 3 characters).'
      );


      return;

    }


    this.isAiGenerating =
      true;


    const activeAmenitiesList =

      this.amenities

        .filter(
          item =>
            item.selected
        )

        .map(
          item =>
            item.name
        )

        .join(', ');


    const activeCategoryType =

      this.categories

        .filter(
          category =>
            category.checked
        )

        .map(
          category =>
            category.name
        )

        .join(' / ');


    const payload = {

      apartmentName:
        currentFormValues.name,


      location:
        this.getFinalLocation(),


      bhk:
        currentFormValues.bhk
          ? currentFormValues.bhk
              .replace(
                /[^0-9]/g,
                ''
              )
          : '1',


      budget:
        currentFormValues.price
          ? `₹${currentFormValues.price}`
          : 'Market Competitive Pricing',


      amenities:

        `Category Spec:
        ${activeCategoryType || 'Residential'}.

        Specs:

        Furnishing level:
        ${currentFormValues.furnishing},

        Facing:
        ${currentFormValues.facing},

        Footprint Area:
        ${currentFormValues.area || 'Standard'} Sq.Ft,

        Bathrooms:
        ${currentFormValues.bathrooms || '1'},

        Floor Matrix:
        ${currentFormValues.propertyFloor}
        of
        ${currentFormValues.totalFloors}
        total floors.

        Extras:
        ${
          activeAmenitiesList ||
          'Standard community benefits'
        }.

        Deal Mode:
        ${currentFormValues.type}`

    };


    console.log(
      'Sending AI payload:',
      payload
    );


    this.http
      .post<any>(
        'http://localhost:5000/api/ai/generate-description',
        payload
      )
      .subscribe({

        next: (
          response: any
        ) => {

          this.isAiGenerating =
            false;


          if (
            response &&
            response.success &&
            response.text
          ) {

            const aiText =
              response.text;


            this.propertyForm.patchValue(
              {
                description:
                  aiText
              }
            );


            if (
              this.quillInstance
            ) {

              const formattedHTML =
                aiText
                  .replace(
                    /\n/g,
                    '<br>'
                  );


              this.quillInstance.root.innerHTML =
                formattedHTML;

            }

          }

          else {

            alert(
              'AI backend returned an invalid response.'
            );

          }

        },


        error: (
          error: any
        ) => {

          console.error(
            'AI Service Error:',
            error
          );


          this.isAiGenerating =
            false;


          alert(
            'AI server processing failed. Please try again.'
          );

        }

      });

  }


  // =========================================================
  // COMPATIBILITY
  // =========================================================

  generateAIDescription(): void {

    this.generateDescriptionWithAI();

  }


  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    if (this.map) {

      this.map.remove();

      this.map = null;

    }


    this.quillInstance =
      null;

  }

}