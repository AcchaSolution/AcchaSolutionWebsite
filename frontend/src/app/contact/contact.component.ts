import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {

  selectedUser: string = 'Owner';
  selectedIntent: string = 'Sell';

  // Existing data fields - kept
  userData = {
    name: '',
    email: '',
    password: '',
    experience: '',
    reraId: '',
    phone: ''
  };

  // Enquiry status
  isSending: boolean = false;
  enquirySent: boolean = false;
  enquiryError: boolean = false;

  constructor(private http: HttpClient) {}

  // =====================================================
  // SEND CONTACT ENQUIRY
  // =====================================================
  onRegister() {
  // ===================================================
  // REQUIRED FIELD VALIDATION
  // ===================================================

  if (
    !this.userData.name?.trim() ||
    !this.userData.phone?.trim() ||
    !this.userData.email?.trim() ||
    !this.userData.experience?.trim() ||
    !this.userData.reraId?.trim() ||
    !this.userData.password?.trim()
  ) {
    alert('Please fill all the required fields before sending your enquiry.');
    return;
  }

    // Reset status
    this.isSending = true;
    this.enquirySent = false;
    this.enquiryError = false;

    console.log('Contact Enquiry:', this.userData);
    console.log('User Type:', this.selectedUser);
    console.log('Intent:', this.selectedIntent);

    const enquiryData = {
      name: this.userData.name,
      email: this.userData.email,
      phone: this.userData.phone,

      // Existing fields reused safely
      location: this.userData.experience,
      propertyType: this.userData.reraId,
      message: this.userData.password,

      userType: this.selectedUser,
      intent: this.selectedIntent
    };

    // ===================================================
    // SEND TO BACKEND
    // ===================================================
  //  'https://api.acchasolution.com/api/properties'

   
this.http.post(
  'http://localhost:5000/api/contact/enquiry',
  enquiryData
)


.subscribe({

        next: (response) => {

          console.log(
            'Enquiry sent successfully:',
            response
          );

          this.isSending = false;
          this.enquirySent = true;

          // Clear form after successful submission
          this.userData = {
            name: '',
            email: '',
            password: '',
            experience: '',
            reraId: '',
            phone: ''
          };

          alert(
            'Thank you! Your enquiry has been sent successfully.'
          );
        },

        error: (error) => {

          console.error(
            'Enquiry sending failed:',
            error
          );

          this.isSending = false;
          this.enquiryError = true;

          alert(
            'Unable to send enquiry right now. Please try again.'
          );
        }

      });
  }
}