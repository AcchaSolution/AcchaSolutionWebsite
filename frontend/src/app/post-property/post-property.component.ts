import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Apni auth service
import { PropertyService } from '../services/property.service';
import { CommonModule } from '@angular/common';
import { SharedService } from '../services/shared.service';
import Swal from 'sweetalert2';
import { Auth, user } from '@angular/fire/auth';

@Component({
  selector: 'app-post-property',
  standalone: true,
  imports: [CommonModule, FormsModule,ReactiveFormsModule], // 2. Yahan 'FormsModule' add karein
  templateUrl: './post-property.component.html',
styleUrls: ['./post-property.component.css']
})
export class PostPropertyComponent implements OnInit {
  private auth = inject(Auth);
  user$ = user(this.auth); // Ye ek Observable hai jo bataega user logged in hai ya nahi
  
  propertyForm: FormGroup;
  isLoggedIn: boolean = false;
// post-property.component.ts mein
 selectedType: string = ''; // Default selection
 loading: boolean = false;
 userInitial: string = '';

userEmail: string = '';
enteredOtp: string = ''; // <--- Yeh line check karein, agar missing hai toh add karein
  showOtpModal: boolean = false;
  otpInput: string = '';
  propertyData = { intent: 'Sell' };
timer: number = 60; // 30 seconds ka timer
timerInterval: any;


selectType(type: string) {
  this.selectedType = type;
}
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private propService: PropertyService,
    private router: Router,
    private sharedService:SharedService

  ) {
    this.propertyForm = this.fb.group({
      propertyName: ['', Validators.required],
      price: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], // 'email' key yahan honi chahiye      // Baki fields yahan add karein...
    });
  }

ngOnInit() {
  const token = localStorage.getItem('authToken');
  const status = localStorage.getItem('userStatus');

  // Agar user ke paas token hai aur status approved hai, tabhi aage jaane do
  if (token && status === 'approved') {
     this.router.navigate(['/add-property-form']);
  } else if (token && status === 'pending') {
     alert("Aapka account abhi pending hai!");
     this.router.navigate(['/home']);
  }
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


// Agar aap chahein toh ye function check karne ke liye use kar sakti hain
isEmailValid(): boolean {
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
  return emailRegex.test(this.userEmail);
}



onStartPosting() {
  if (!this.userEmail) {
    Swal.fire('Error', 'Please enter your email', 'error');
    return;
  }

  this.loading = true;

  // Email ko lowercase karke bhejein taaki mismatch na ho
  this.authService.checkUserStatus(this.userEmail.toLowerCase()).subscribe({
    next: (res: any) => {
      this.loading = false;
      console.log("Backend Response:", res); // YE ZAROORI HAI!
      
      if (res.status === 'not_found') {
Swal.fire({
  icon: 'error',
  title: 'Account Not Found',
  text: 'This email is not registered with us. Please register first or log in with your registered email before posting a property.',
  confirmButtonText: 'OK'
});
      } 
          else if (res.status === 'pending') {
Swal.fire({
  icon: 'warning',
  title: 'Approval Pending',
  text: 'Your account is still waiting for admin approval. You can post a property once your account is approved.',
  confirmButtonText: 'OK'
});      } 


 else if (res.status === 'approved') {

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

    // AuthService ka email state bhi update karo
    this.authService.updateEmail(
      res.user.email || this.userEmail
    );

  } else {

    // Fallback
    localStorage.setItem(
      'userEmail',
      this.userEmail
    );

  }

Swal.fire({
  title: 'Welcome Back!',
  text: 'Your email has been verified successfully. Redirecting to the property listing page...',
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
      Swal.fire('Error', 'Server error!', 'error');
    }
  });
}



// OTP bhejne wala alag function
proceedToOtp() {
  this.authService.sendOtp(this.userEmail).subscribe({
    next: () => {
      this.loading = false;
      this.showOtpModal = true;
      this.startTimer();
    },
    error: () => {
      this.loading = false;
      Swal.fire('Error', 'OTP send failed!', 'error');
    }
  });
}


resendOtp() 
{
  console.log("Resending OTP to:", this.userEmail);
  this.otpInput = ''; // Purana input clear karein
  this.startTimer(); // Timer wapas 30s se shuru
  alert('New OTP has been sent to your email!');
}



verifyOtp() {
    this.loading = true;
    this.authService.verifyOtp(this.userEmail, this.otpInput).subscribe({
      next: (res: any) => {
        this.loading = false;
        
        // Check karein ki response mein verified true hai
        if (res && res.verified) {
          
          // TOKEN aur STATUS save karein (yahi redirection ke liye zaroori hai)
          localStorage.setItem('authToken', res.token);
          localStorage.setItem('userStatus', res.status || 'approved');

          Swal.fire({
            icon: 'success',
            title: 'Verified!',
            text: 'Email verified successfully.'
          }).then((result) => {
            if (result.isConfirmed) {
              this.showOtpModal = false;
              this.router.navigate(['/add-property-form']);
            }
          });
        } else {
          Swal.fire({ icon: 'error', title: 'Invalid OTP', text: 'Sahi OTP dalein' });
        }
      },
      error: (err) => {
        this.loading = false;
        console.error("API Error:", err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Server se connect nahi ho pa raha' });
      }
    });
  }


closeModal() {
  this.showOtpModal = false;
  this.otpInput = '';        // Data clear
  this.timer = 0;            // Timer stop
  clearInterval(this.timerInterval);
}
}