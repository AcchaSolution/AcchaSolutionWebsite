import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-rental-agreement',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './rental-agreement.component.html',
  styleUrls: ['./rental-agreement.component.css']
})
export class RentalAgreementComponent {

  // =====================================================
  // FORM
  // =====================================================

  rentalForm: FormGroup;

  // =====================================================
  // UI STATE
  // =====================================================

  isSubmitting = false;

  // =====================================================
  // ADDITIONAL TENANTS
  // =====================================================

  additionalTenants: {
    name: string;
    phone: string;
  }[] = [];

  // =====================================================
  // CUSTOM CLAUSES
  // =====================================================

  customClauses: string[] = [];

  // =====================================================
  // DOCUMENTS
  // =====================================================

  selectedFiles: {
    [key: string]: File | null;
  } = {
    ownerAadhaar: null,
    ownerPan: null,
    ownerAddressProof: null,
    propertyProof: null,

    tenantAadhaar: null,
    tenantPan: null,
    tenantAddressProof: null
  };

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private fb: FormBuilder
  ) {

    this.rentalForm = this.fb.group({

      // -------------------------------------------------
      // AGREEMENT DETAILS
      // -------------------------------------------------

      agreementType: [
        '',
        Validators.required
      ],

      duration: [
        '',
        Validators.required
      ],

      startDate: [
        '',
        Validators.required
      ],

      endDate: [
        '',
        Validators.required
      ],

      noticePeriod: [
        '30-days'
      ],

      lockInPeriod: [
        'none'
      ],

      // -------------------------------------------------
      // PROPERTY DETAILS
      // -------------------------------------------------

      propertyType: [
        '',
        Validators.required
      ],

      propertyName: [
        ''
      ],

      propertyNumber: [
        ''
      ],

      floor: [
        ''
      ],

      propertyAddress: [
        '',
        Validators.required
      ],

      locality: [
        '',
        Validators.required
      ],

      city: [
        '',
        Validators.required
      ],

      state: [
        '',
        Validators.required
      ],

      pincode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{6}$/)
        ]
      ],

      // -------------------------------------------------
      // OWNER
      // -------------------------------------------------

      owner: this.fb.group({

        name: [
          '',
          Validators.required
        ],

        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[6-9][0-9]{9}$/)
          ]
        ],

        email: [
          '',
          Validators.email
        ],

        pan: [
          '',
          Validators.pattern(
            /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
          )
        ],

        aadhaar: [
          '',
          Validators.pattern(/^[0-9]{12}$/)
        ],

        address: [
          ''
        ]

      }),

      // -------------------------------------------------
      // TENANT
      // -------------------------------------------------

      tenant: this.fb.group({

        name: [
          '',
          Validators.required
        ],

        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[6-9][0-9]{9}$/)
          ]
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        pan: [
          '',
          Validators.pattern(
            /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
          )
        ],

        aadhaar: [
          '',
          Validators.pattern(/^[0-9]{12}$/)
        ],

        address: [
          ''
        ]

      }),

      // -------------------------------------------------
      // RENT & FINANCIAL DETAILS
      // -------------------------------------------------

      monthlyRent: [
        '',
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      securityDeposit: [
        '',
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      maintenance: [
        0,
        Validators.min(0)
      ],

      rentDueDate: [
        '5'
      ],

      paymentMode: [
        ''
      ],

      otherCharges: [
        0,
        Validators.min(0)
      ],

      // -------------------------------------------------
      // PROPERTY HANDOVER
      // -------------------------------------------------

      possessionDate: [
        ''
      ],

      furnishing: [
        ''
      ],

      parking: [
        ''
      ],

      parkingNumber: [
        ''
      ],

      keys: [
        0,
        Validators.min(0)
      ],

      furniture: [
        ''
      ],

      // -------------------------------------------------
      // TERMS & CONDITIONS
      // -------------------------------------------------

      rentPaymentClause: [
        true
      ],

      securityDepositClause: [
        true
      ],

      maintenanceClause: [
        true
      ],

      propertyUsageClause: [
        true
      ],

      sublettingClause: [
        true
      ],

      terminationClause: [
        true
      ],

      // -------------------------------------------------
      // CONSENT
      // -------------------------------------------------

      informationConsent: [
        false,
        Validators.requiredTrue
      ],

      documentConsent: [
        false,
        Validators.requiredTrue
      ]

    });

  }

  // =====================================================
  // ADD TENANT
  // =====================================================

  addTenant(): void {

    this.additionalTenants.push({
      name: '',
      phone: ''
    });

  }

  // =====================================================
  // REMOVE TENANT
  // =====================================================

  removeTenant(index: number): void {

    if (
      index >= 0 &&
      index < this.additionalTenants.length
    ) {
      this.additionalTenants.splice(index, 1);
    }

  }

  // =====================================================
  // ADD CUSTOM CLAUSE
  // =====================================================

  addClause(): void {

    this.customClauses.push('');

  }

  // =====================================================
  // REMOVE CUSTOM CLAUSE
  // =====================================================

  removeClause(index: number): void {

    if (
      index >= 0 &&
      index < this.customClauses.length
    ) {
      this.customClauses.splice(index, 1);
    }

  }

  // =====================================================
  // FILE SELECT
  // =====================================================

  onFileSelected(
    event: Event,
    documentType: string
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const file = input.files[0];

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {

      alert(
        'Please upload PDF, JPG, JPEG or PNG file.'
      );

      input.value = '';

      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {

      alert(
        'File size must be less than 10 MB.'
      );

      input.value = '';

      return;
    }

    this.selectedFiles[documentType] = file;

    console.log(
      'Selected document:',
      documentType,
      file.name
    );

  }

  // =====================================================
  // PREVIEW AGREEMENT
  // =====================================================

  previewAgreement(): void {

    this.markFormTouched();

    if (this.rentalForm.invalid) {

      alert(
        'Please complete the required fields before preview.'
      );

      return;
    }

    const data =
      this.getAgreementData();

    console.log(
      'RENTAL AGREEMENT PREVIEW:',
      data
    );

    alert(
      'Preview data is ready. PDF preview will be connected in the next step.'
    );

  }

  // =====================================================
  // SUBMIT AGREEMENT
  // =====================================================

  submitAgreement(): void {

    this.markFormTouched();

    if (this.rentalForm.invalid) {

      alert(
        'Please complete all required fields.'
      );

      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const agreementData =
      this.getAgreementData();

    console.log(
      'RENTAL AGREEMENT SUBMISSION:',
      agreementData
    );

    setTimeout(() => {

      this.isSubmitting = false;

      alert(
        'Rental Agreement request submitted successfully.'
      );

      console.log(
        'FINAL AGREEMENT DATA:',
        agreementData
      );

    }, 800);

  }

  // =====================================================
  // PREPARE AGREEMENT DATA
  // =====================================================

  private getAgreementData(): any {

    const formValue =
      this.rentalForm.getRawValue();

    return {

      agreementType:
        formValue.agreementType,

      duration:
        formValue.duration,

      startDate:
        formValue.startDate,

      endDate:
        formValue.endDate,

      noticePeriod:
        formValue.noticePeriod,

      lockInPeriod:
        formValue.lockInPeriod,

      property: {

        type:
          formValue.propertyType,

        name:
          formValue.propertyName,

        number:
          formValue.propertyNumber,

        floor:
          formValue.floor,

        address:
          formValue.propertyAddress,

        locality:
          formValue.locality,

        city:
          formValue.city,

        state:
          formValue.state,

        pincode:
          formValue.pincode

      },

      owner:
        formValue.owner,

      tenant:
        formValue.tenant,

      additionalTenants:
        this.additionalTenants.map(
          tenant => ({
            name: tenant.name,
            phone: tenant.phone
          })
        ),

      financial: {

        monthlyRent:
          formValue.monthlyRent,

        securityDeposit:
          formValue.securityDeposit,

        maintenance:
          formValue.maintenance,

        rentDueDate:
          formValue.rentDueDate,

        paymentMode:
          formValue.paymentMode,

        otherCharges:
          formValue.otherCharges

      },

      handover: {

        possessionDate:
          formValue.possessionDate,

        furnishing:
          formValue.furnishing,

        parking:
          formValue.parking,

        parkingNumber:
          formValue.parkingNumber,

        keys:
          formValue.keys,

        furniture:
          formValue.furniture

      },

      terms: {

        rentPaymentClause:
          formValue.rentPaymentClause,

        securityDepositClause:
          formValue.securityDepositClause,

        maintenanceClause:
          formValue.maintenanceClause,

        propertyUsageClause:
          formValue.propertyUsageClause,

        sublettingClause:
          formValue.sublettingClause,

        terminationClause:
          formValue.terminationClause,

        customClauses:
          this.customClauses.filter(
            clause =>
              clause.trim().length > 0
          )

      },

      documents:
        this.getDocumentMetadata(),

      consent: {

        informationConsent:
          formValue.informationConsent,

        documentConsent:
          formValue.documentConsent

      }

    };

  }

  // =====================================================
  // DOCUMENT METADATA
  // =====================================================

  private getDocumentMetadata(): any {

    const documents: any = {};

    Object.keys(
      this.selectedFiles
    ).forEach(key => {

      const file =
        this.selectedFiles[key];

      if (file) {

        documents[key] = {

          fileName:
            file.name,

          fileType:
            file.type,

          fileSize:
            file.size

        };

      }

    });

    return documents;

  }

  // =====================================================
  // MARK ALL FORM CONTROLS TOUCHED
  // =====================================================

  private markFormTouched(): void {

    this.rentalForm.markAllAsTouched();

  }

  // =====================================================
  // GET CONTROL
  // =====================================================

  getControl(
    controlName: string
  ): any {

    return this.rentalForm.get(
      controlName
    );

  }

}