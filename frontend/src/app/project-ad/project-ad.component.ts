import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-project-ad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './project-ad.component.html',
  styleUrls: ['./project-ad.component.css']
})
export class ProjectAdComponent implements OnInit {
  projectForm!: FormGroup;
  selectedAmenities: string[] = [];
  selectedFiles: File[] = [];

  // Pop-up operational state control parameters
  showQRModal: boolean = false;
  currentSelectedPlan: string = '';
  currentPlanPrice: number = 0;
showPaymentSuccessModal: boolean = false;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
      private router: Router

  ) {}

  ngOnInit(): void {
    // Structural client-side validation rules tracking
    this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
      builderName: ['', Validators.required],
      propertyType: ['', Validators.required],
      location: ['', Validators.required],
      price: ['', Validators.required],
      possessionStatus: ['', Validators.required],
      reraNumber: [''],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  // Captures checkbox adjustments for property features
  onAmenityChange(event: any, amenity: string): void {
    if (event.target.checked) {
      this.selectedAmenities.push(amenity);
    } else {
      const index = this.selectedAmenities.indexOf(amenity);
      if (index > -1) this.selectedAmenities.splice(index, 1);
    }
  }

  // Validates file uploads dynamically to block corrupted assets
  onFileSelect(event: any): void {
    const files = Array.from(event.target.files) as File[];
    
    if (files.length > 5) {
      alert('Security Alert: You can only upload a maximum of 5 project images.');
      event.target.value = '';
      this.selectedFiles = [];
      return;
    }

    const validatedFiles: File[] = [];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB Limit

    for (let file of files) {
      if (file.size > maxSizeBytes) {
        alert(`Validation Error: File "${file.name}" exceeds the 5MB size limit.`);
        event.target.value = '';
        this.selectedFiles = [];
        return;
      }

      const allowedExtensions = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedExtensions.includes(file.type)) {
        alert(`Format Error: "${file.name}" is invalid. Only JPG, PNG, and PDF brochures are supported.`);
        event.target.value = '';
        this.selectedFiles = [];
        return;
      }
      validatedFiles.push(file);
    }
    this.selectedFiles = validatedFiles;
  }

  // Triggered when clicking 'Buy Now' inside your layout table matrices
  processPayment(planType: string): void {
    if (this.projectForm.invalid) {
      alert('Please fill out all required details before choosing a plan.');
      return;
    }

    this.currentSelectedPlan = planType;
    
    // Evaluate operational pricing maps based on column choice selection keys
    if (planType === 'flexi') this.currentPlanPrice = 50;
    else if (planType === 'silver') this.currentPlanPrice = 999;
    else if (planType === 'gold') this.currentPlanPrice = 2499;
    else if (planType === 'platinum') this.currentPlanPrice = 4999;

    // Toggle the popup frame open instantly
    this.showQRModal = true;
  }

  closeQRModal(): void {
    this.showQRModal = false;
  }

// 🎯 FIX: Handle QR payment submission
submitWithQRCode(): void {

  if (this.projectForm.invalid) {
    alert('Your project parameters form state is invalid.');
    return;
  }

  const payload = {
    ...this.projectForm.value,
    amenities: this.selectedAmenities,
    chosenPlan: this.currentSelectedPlan
  };

  console.log(
    'Posting validated form package over to API channel:',
    payload
  );

  // Forward payment submission details to backend
  this.http
    .post(
      'https://api.acchasolution.com/api/payments/qr-submission',
      payload
    )
    .subscribe({

      next: (res: any) => {

        console.log(
          '✅ Payment submission successful:',
          res
        );

        /*
         * Close QR scanner popup
         */
        this.showQRModal = false;

        /*
         * Open modern payment success popup
         */
        this.showPaymentSuccessModal = true;

        /*
         * IMPORTANT:
         * Do NOT reset the form here.
         *
         * Success popup still needs:
         * projectName
         * currentSelectedPlan
         * currentPlanPrice
         */

      },

      error: (err) => {

        console.error(
          '❌ Submission transaction connection error:',
          err
        );

        alert(
          'Network transaction logging failure. Please try again.'
        );

      }

    });
}



goToPropertyDetails(): void {

  this.showPaymentSuccessModal = false;

  console.log(
    '➡️ Payment successful. Navigating to property details.'
  );

  alert(
    'Payment submitted successfully. Your promotion request has been received for verification.'
  );

}
}
