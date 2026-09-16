import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PropertyService } from '../services/property.service';
import { CommonModule } from '@angular/common';
import { SharedService } from '../services/shared.service';
import Swal from 'sweetalert2';
import { Auth, user } from '@angular/fire/auth';

@Component({
  selector: 'app-post-property',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './post-property.component.html',
  styleUrls: ['./post-property.component.css']
})
export class PostPropertyComponent implements OnInit {

  private auth = inject(Auth);

  // Observable that tells whether the Firebase user is logged in
  user$ = user(this.auth);

  propertyForm: FormGroup;

  isLoggedIn: boolean = false;

  // Post-property form state
  selectedType: string = '';
  loading: boolean = false;
  userInitial: string = '';

  userEmail: string = '';
  enteredOtp: string = '';

  showOtpModal: boolean = false;
  otpInput: string = '';

  propertyData = {
    intent: 'Sell'
  };

  timer: number = 60;
  timerInterval: any;

  selectType(type: string) {
    this.selectedType = type;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private propService: PropertyService,
    private router: Router,
    private sharedService: SharedService
  ) {
    this.propertyForm = this.fb.group({
      propertyName: ['', Validators.required],
      price: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    const token = localStorage.getItem('authToken');
    const status = localStorage.getItem('userStatus');

    const publicUserLoggedIn =
      localStorage.getItem('publicUserLoggedIn') === 'true';

    // Pending account
    if (token && status === 'pending') {
      alert('Your account is currently pending approval.');
      this.router.navigate(['/home']);
      return;
    }

    // Already logged-in normal user
    if (token && publicUserLoggedIn) {
      this.isLoggedIn = true;
      this.router.navigate(['/add-property-form']);
      return;
    }

    // User is not logged in
    this.isLoggedIn = false;
  }

  startTimer() {
    this.timer = 60;

    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  // Check whether the entered email is valid
  isEmailValid(): boolean {
    const emailRegex =
      /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

    return emailRegex.test(this.userEmail);
  }

  onStartPosting() {

    if (!this.userEmail) {
      Swal.fire(
        'Error',
        'Please enter your email',
        'error'
      );
      return;
    }

    this.loading = true;

    // Convert email to lowercase to avoid email mismatch
    this.authService
      .checkUserStatus(this.userEmail.toLowerCase())
      .subscribe({

        next: (res: any) => {

          this.loading = false;

          console.log(
            'Backend Response:',
            res
          );

          if (res.status === 'not_found') {

            Swal.fire({
              icon: 'error',
              title: 'Account Not Found',
              text:
                'This email is not registered with us. Please register first or log in with your registered email before posting a property.',
              confirmButtonText: 'OK'
            });

          } else if (res.status === 'pending') {

            Swal.fire({
              icon: 'warning',
              title: 'Approval Pending',
              text:
                'Your account is still waiting for admin approval. You can post a property once your account is approved.',
              confirmButtonText: 'OK'
            });

          } else if (res.status === 'approved') {

            // ================================
            // SAVE LOGIN SESSION
            // ================================

            localStorage.setItem(
              'authToken',
              res.token
            );

            localStorage.setItem(
              'userStatus',
              'approved'
            );

            localStorage.setItem(
              'publicUserLoggedIn',
              'true'
            );

            // ================================
            // SAVE USER DATA
            // ================================

            if (res.user) {

              localStorage.setItem(
                'user',
                JSON.stringify(res.user)
              );

              localStorage.setItem(
                'userName',
                res.user.name || ''
              );

              localStorage.setItem(
                'userEmail',
                res.user.email || this.userEmail
              );

              // Update the email state in AuthService
              this.authService.updateEmail(
                res.user.email || this.userEmail
              );

            } else {

              // Fallback when user data is not available
              localStorage.setItem(
                'userEmail',
                this.userEmail
              );
            }

            Swal.fire({
              title: 'Welcome Back!',
              text:
                'Your email has been verified successfully. Redirecting to the property listing page...',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {

              this.router.navigate([
                '/add-property-form'
              ]);

            });
          }
        },

        error: () => {

          this.loading = false;

          Swal.fire(
            'Error',
            'Server error!',
            'error'
          );
        }
      });
  }

  // Send OTP to the user's email
  proceedToOtp() {

    this.authService
      .sendOtp(this.userEmail)
      .subscribe({

        next: () => {

          this.loading = false;
          this.showOtpModal = true;
          this.startTimer();
        },

        error: () => {

          this.loading = false;

          Swal.fire(
            'Error',
            'OTP send failed!',
            'error'
          );
        }
      });
  }

  resendOtp() {

    console.log(
      'Resending OTP to:',
      this.userEmail
    );

    // Clear previous OTP input
    this.otpInput = '';

    // Restart the timer
    this.startTimer();

    alert(
      'A new OTP has been sent to your email!'
    );
  }

  verifyOtp() {

    this.loading = true;

    this.authService
      .verifyOtp(
        this.userEmail,
        this.otpInput
      )
      .subscribe({

        next: (res: any) => {

          this.loading = false;

          // Check whether the response contains verified: true
          if (res && res.verified) {

            // Save token and account status for redirection
            localStorage.setItem(
              'authToken',
              res.token
            );

            localStorage.setItem(
              'userStatus',
              res.status || 'approved'
            );

            Swal.fire({
              icon: 'success',
              title: 'Verified!',
              text:
                'Email verified successfully.'
            }).then((result) => {

              if (result.isConfirmed) {

                this.showOtpModal = false;

                this.router.navigate([
                  '/add-property-form'
                ]);
              }
            });

          } else {

            Swal.fire({
              icon: 'error',
              title: 'Invalid OTP',
              text: 'Please enter the correct OTP.'
            });
          }
        },

        error: (err) => {

          this.loading = false;

          console.error(
            'API Error:',
            err
          );

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              'Unable to connect to the server.'
          });
        }
      });
  }

  closeModal() {

    this.showOtpModal = false;

    // Clear entered OTP
    this.otpInput = '';

    // Stop the timer
    this.timer = 0;

    clearInterval(this.timerInterval);
  }
}