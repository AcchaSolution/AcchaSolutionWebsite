import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true, // Modern Angular 17+ features
  imports: [CommonModule, FormsModule], // Templates mein form aur directives use karne ke liye
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'] // Agar Tailwind use kar rahe hain toh isse khali rakh sakte hain
})
export class AuthComponent implements OnInit {
  
  // 1. UI Control Variables (Login aur Signup tab toggle karne ke liye)
  activeTab: 'login' | 'signup' = 'login';

  // 2. Form Ke Data Models (Yahan user ka input save hoga)
  loginData = { email: '', password: '' };
  signUpData = { name: '', email: '', password: '' };

  // 3. Google Client ID (Isse Google Cloud Console se badlein)
  private readonly googleClientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    // Jab page load hoga, tab Google SDK configure hoga
    if ((window as any).google) {
      this.initGoogleAuth();
    } else {
      // Agar script late load ho toh window event trigger karein
      (window as any).onGoogleLibraryLoad = () => {
        this.initGoogleAuth();
      };
    }
  }

  // Tab switch karne ka function
  switchTab(tab: 'login' | 'signup') {
    this.activeTab = tab;
    // Agar login tab par wapas aayein, toh button ko dubara render karna padta hai
    if (tab === 'login') {
      setTimeout(() => this.renderGoogleButton(), 50);
    }
  }

  // Google Sign-In ki core setting initialize karna
  initGoogleAuth() {
    (window as any).google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: this.handleCredentialResponse.bind(this), // Callback function attach kiya
      context: 'signin',
      ux_mode: 'popup' // Screen par small popup khulega
    });

    if (this.activeTab === 'login') {
      this.renderGoogleButton();
    }
  }

  // HTML page par bane div target ke andar Google button render karna
  renderGoogleButton() {
    const element = document.getElementById('google-btn-container');
    if (element) {
      (window as any).google.accounts.id.renderButton(element, {
        type: 'standard',
        shape: 'rounded',
        theme: 'outline',
        text: 'continue_with',
        size: 'large',
        logo_alignment: 'left'
      });
    }
  }

  // Google se authentication token milne ke baad yeh function call hoga
  handleCredentialResponse(response: any) {
    // NgZone ka use zaroori hai taaki Angular UI turant update ho jaye (jaise loader band karna ya redirect karna)
    this.ngZone.run(() => {
      console.log('Google Encoded JWT ID Token:', response.credential);
      alert('Google Authentication Successful!');

      // BACKEND CALL: Yahan se aap token ko apne Node.js backend par bhej sakte hain
      // this.http.post('/api/auth/google', { token: response.credential }).subscribe(...)
    });
  }

  // Standard Email Login Submit Function
  onLoginSubmit() {
    console.log('Login Form Data:', this.loginData);
    alert(`Logging in with: ${this.loginData.email}`);
    // Yahan normal sign-in service call karein
  }

  // New User Sign Up Submit Function
  onSignUpSubmit() {
    console.log('Sign Up Form Data:', this.signUpData);
    alert(`Creating account for: ${this.signUpData.email}`);
    // Yahan registration service call karein
  }
}