import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// TypeScript ke liye global declaration (Class ke bahar hona chahiye)
declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
private clientId =
  '109325296562-runu0ib2cf6oofmanaa799kja67jg1os.apps.googleusercontent.com';
  
    activeTab: 'login' | 'signup' = 'login';
  loginData = { email: '', password: '' };
  signUpData = { name: '', email: '', password: '', phone: '', experience: '' };
  selectedUser: string = 'Owner';
  showPassword = false;

  ngOnInit() {
    // Component load hote hi Google Sign-In initialize ho jayega
    this.initGoogleSign();
  }

  // Tab Switching
  toggleAuthMode() {
    this.activeTab = (this.activeTab === 'login') ? 'signup' : 'login';
  }

  // =========================================================
  // LOGIN LOGIC (Using Custom Node.js Backend)
  // =========================================================
onLoginSubmit() {

  const credentials = {
    email: this.loginData.email.trim(),
    password: this.loginData.password
  };

  this.authService.loginUser(credentials).subscribe({

    next: (res: any) => {

      console.log('Login Response:', res);

      if (res && res.success) {

        // ==============================
        // ADMIN LOGIN
        // ==============================

        if (
          res.user &&
          res.user.role === 'admin'
        ) {

          this.router.navigate(['/dashboard']);

        }

        // ==============================
        // NORMAL USER LOGIN
        // ==============================

        else {

          const returnUrl =
            this.route.snapshot.queryParams['returnUrl']
            || '/agent-portal';

          this.router.navigateByUrl(returnUrl);

        }

      }

    },

    error: (error: any) => {

      console.error(
        'User Login Error:',
        error
      );

      const errorMessage =
        error?.error?.message ||
        error?.message ||
        'Invalid email or password.';

      alert(errorMessage);

    }

  });

}
  // =========================================================
  // USER SIGNUP (Via Node.js Backend)
  // =========================================================
  onSignUpSubmit() {
    const signupDataPayload = {
      name: this.signUpData.name,
      email: this.signUpData.email,
      password: this.signUpData.password,
      phone: this.signUpData.phone,
      experience: this.signUpData.experience,
      role: this.selectedUser.toLowerCase()
    };

    this.authService.signup(signupDataPayload).subscribe({
      next: (res: any) => {
        alert('Registration Successful! Please wait for Admin approval.');
        this.activeTab = 'login';
        this.signUpData = {
          name: '',
          email: '',
          password: '',
          phone: '',
          experience: ''
        };
      },
      error: (error: any) => {
        console.error('Registration Error:', error);
        const errorMessage = error?.error?.message || error?.message || 'Server connection failed.';
        alert('Registration failed: ' + errorMessage);
      }
    });
  }


  // =========================================================
  // GOOGLE IDENTITY SERVICES (GIS) LOGIC
  // =========================================================
//   initGoogleSign() {
//     // Yahan apna Google Client ID dalein (jo Google Cloud Console se milega)
// const clientId = '109325296562-6drgbfpcmh8a04olspata31cj90m4l9d.apps.googleusercontent.com';

//     if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
//     console.error('Client ID is missing or invalid!');
//     return;
//   }
  
//     if (typeof google !== 'undefined' && google.accounts) {
//       google.accounts.id.initialize({
//         client_id: clientId,
//         callback: (response: any) => this.handleGoogleResponse(response)
//       });
//     }
//   }

initGoogleSign() {

  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.initialize({
      client_id: this.clientId,
      callback: (response: any) => this.handleGoogleResponse(response),
      use_fedcm_for_prompt: false // <--- Yeh line zaroor add karein local testing ke liye
    });

    // Google ka official button HTML container mein render karega
    const googleBtnElement = document.getElementById('google-btn');
      if (googleBtnElement) {
        google.accounts.id.renderButton(googleBtnElement, {
          theme: 'outline',
          size: 'large',
          width: '100%'
        });
      }
    } else {
      // Agar script load hone mein thoda time lag raha ho toh 1 second baad dobara try karein
      setTimeout(() => this.initGoogleSign(), 1000);
    }
  }
  
ngAfterViewInit(): void {
    this.renderGoogleButtonWhenReady();
  }

  renderGoogleButtonWhenReady() {
    const checkGoogle = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(checkGoogle);
        
        google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response: any) => this.handleGoogleResponse(response),
          use_fedcm_for_prompt: false
        });

        const buttonElement = document.getElementById('google-btn');
        if (buttonElement) {
          google.accounts.id.renderButton(buttonElement, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular'
          });
        }
      }
    }, 100); // Har 100ms mein check karega jab tak script load na ho jaye
  }

  handleGoogleResponse(response: any) {
    const token = response.credential;

    this.authService.googleLogin({ token }).subscribe({
      next: (res: any) => {
        console.log('Google Login Success:', res);
        localStorage.setItem('token', res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Backend Google Auth Failed:', err);
        alert(err.error?.message || 'Google login failed on server.');
      }
    });
  }


  triggerGoogleLogin() {
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        console.warn('Prompt display nahi hua, reason:', notification.getNotDisplayedReason());
      }
    });
  }
}



}