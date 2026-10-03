import {
  Component,
  OnInit,
  AfterViewInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent
  implements OnInit, AfterViewInit {

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private clientId =
    '109325296562-68hmr28motfoli131krmvte964c4v6os.apps.googleusercontent.com';
  activeTab: 'login' | 'signup' = 'login';

  loginData = {
    email: '',
    password: ''
  };

  signUpData = {
    name: '',
    email: '',
    password: '',
    phone: '',
    experience: ''
  };

  selectedUser: string = 'Owner';

showLoginPassword = false;
showSignupPassword = false;


  private googleInitialized = false;
  private googleCheckTimer: any = null;


  // =========================================================
  // COMPONENT INIT
  // =========================================================

  ngOnInit(): void {
    // Google ko yahan initialize nahi karna hai.
    // Sirf ngAfterViewInit() se button render hoga.
  }


  // =========================================================
  // GOOGLE BUTTON INITIALIZATION
  // =========================================================

  ngAfterViewInit(): void {
    this.renderGoogleButtonWhenReady();
  }


  renderGoogleButtonWhenReady(): void {

    // Already initialized hai to dobara mat karo
    if (this.googleInitialized) {
      return;
    }

    // Existing timer ko clear karo
    if (this.googleCheckTimer) {
      clearInterval(this.googleCheckTimer);
    }

    this.googleCheckTimer = setInterval(() => {

      // Google Identity Services abhi load nahi hua
      if (
        typeof google === 'undefined' ||
        !google.accounts ||
        !google.accounts.id
      ) {
        return;
      }

      const buttonElement =
        document.getElementById('google-btn');

      // HTML button container abhi available nahi
      if (!buttonElement) {
        return;
      }

      clearInterval(this.googleCheckTimer);
      this.googleCheckTimer = null;

      // Google ko sirf EK baar initialize karo
      google.accounts.id.initialize({
        client_id: this.clientId,

        callback: (response: any) => {
          this.handleGoogleResponse(response);
        },

        use_fedcm_for_prompt: false
      });

      // Google official button render
      google.accounts.id.renderButton(
        buttonElement,
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          type: 'standard',
          shape: 'rectangular'
        }
      );

      this.googleInitialized = true;

    }, 100);
  }


  // =========================================================
  // TAB SWITCHING
  // =========================================================

  toggleAuthMode(): void {

    this.activeTab =
      this.activeTab === 'login'
        ? 'signup'
        : 'login';
  }


  // =========================================================
  // NORMAL LOGIN
  // =========================================================

  onLoginSubmit(): void {

    const credentials = {
      email: this.loginData.email.trim(),
      password: this.loginData.password
    };

    this.authService
      .loginUser(credentials)
      .subscribe({

        next: (res: any) => {

          console.log(
            'Login Response:',
            res
          );

          if (
            res &&
            res.success
          ) {

            // ADMIN LOGIN
            if (
              res.user &&
              res.user.role === 'admin'
            ) {

              this.router.navigate([
                '/dashboard'
              ]);

            }

            // NORMAL USER LOGIN
            else {

              const returnUrl =
                this.route.snapshot.queryParams[
                  'returnUrl'
                ] || '/agent-portal';

              this.router.navigateByUrl(
                returnUrl
              );
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
  // USER SIGNUP
  // =========================================================

  onSignUpSubmit(): void {

    const signupDataPayload = {

      name: this.signUpData.name,

      email: this.signUpData.email,

      password: this.signUpData.password,

      phone: this.signUpData.phone,

      experience:
        this.signUpData.experience,

      role:
        this.selectedUser.toLowerCase()
    };

    this.authService
      .signup(signupDataPayload)
      .subscribe({

        next: (res: any) => {

          alert(
            'Registration Successful! Please wait for Admin approval.'
          );

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

          console.error(
            'Registration Error:',
            error
          );

          const errorMessage =
            error?.error?.message ||
            error?.message ||
            'Server connection failed.';

          alert(
            'Registration failed: ' +
            errorMessage
          );
        }

      });
  }


  // =========================================================
  // GOOGLE LOGIN RESPONSE
  // =========================================================

  handleGoogleResponse(
    response: any
  ): void {

    if (
      !response ||
      !response.credential
    ) {

      alert(
        'Google login failed. Google credential was not received.'
      );

      return;
    }

    const token =
      response.credential;

    this.authService
      .googleLogin({ token })
      .subscribe({

        next: (res: any) => {

          console.log(
            'Google Login Success:',
            res
          );

          if (
            res &&
            res.success &&
            res.token
          ) {

            localStorage.setItem(
              'authToken',
              res.token
            );

            this.router.navigate([
              '/dashboard'
            ]);
          }
        },

        error: (err: any) => {

          console.error(
            'Backend Google Auth Failed:',
            err
          );

          alert(
            err?.error?.message ||
            'Google login failed on server.'
          );
        }

      });
  }


  // =========================================================
  // OPTIONAL GOOGLE PROMPT
  // =========================================================
  // Is method ko automatically call nahi kiya ja raha.
  // Official Google button upar render kiya gaya hai.

  triggerGoogleLogin(): void {

    if (
      typeof google !== 'undefined' &&
      google.accounts &&
      google.accounts.id
    ) {

      google.accounts.id.prompt(
        (notification: any) => {

          if (
            notification.isNotDisplayed()
          ) {

            console.warn(
              'Google prompt not displayed:',
              notification.getNotDisplayedReason()
            );
          }
        }
      );
    }
  }
  
  
// =========================================================
// FORGOT PASSWORD
// =========================================================

forgotStep: 0 | 1 | 2 | 3 = 0;

forgotEmail = '';
forgotOtp = '';
forgotNewPassword = '';
forgotConfirmPassword = '';
forgotOtpTimer = 600;
forgotOtpTimerInterval: any = null;

forgotOtpVerified = false;

forgotLoading = false;
forgotMessage = '';
forgotError = '';

showForgotNewPassword = false;
showForgotConfirmPassword = false;


openForgotPassword(): void {

  this.forgotStep = 1;

  this.forgotEmail = '';
  this.forgotOtp = '';
  this.forgotNewPassword = '';
  this.forgotConfirmPassword = '';

  this.forgotLoading = false;
  this.forgotMessage = '';
  this.forgotError = '';

  this.showForgotNewPassword = false;
  this.showForgotConfirmPassword = false;
}


closeForgotPassword(): void {

  this.forgotStep = 0;

  this.forgotError = '';
  this.forgotMessage = '';
}


startForgotOtpTimer(): void {

  // Agar koi purana timer chal raha hai to stop karo
  if (this.forgotOtpTimerInterval) {
    clearInterval(this.forgotOtpTimerInterval);
  }

  // 10 minutes
  this.forgotOtpTimer = 600;

  this.forgotOtpTimerInterval =
    setInterval(() => {

      if (this.forgotOtpTimer > 0) {

        this.forgotOtpTimer--;

      } else {

        clearInterval(
          this.forgotOtpTimerInterval
        );

        this.forgotOtpTimerInterval = null;

      }

    }, 1000);

}



sendForgotOtp(): void {

  if (!this.forgotEmail.trim()) {

    this.forgotError =
      'Please enter your registered email.';

    return;
  }

  this.forgotError = '';
  this.forgotMessage = '';
  this.forgotLoading = true;

  this.authService
    .sendForgotPasswordOtp(
      this.forgotEmail.trim()
    )
    .subscribe({

      next: (res: any) => {

        this.forgotLoading = false;


      if (res?.success) {

  this.forgotStep = 2;

  this.forgotOtp = '';

  this.forgotOtpVerified = false;

  this.forgotMessage =
    'OTP has been sent to your registered email.';

  this.startForgotOtpTimer();

}
        else {

          this.forgotError =
            res?.message ||
            'Unable to send OTP.';

        }

      },

      error: (error) => {

        this.forgotLoading = false;

        this.forgotError =
          error?.error?.message ||
          'Unable to send OTP. Please try again.';

      }

    });

}

verifyForgotPasswordOtp(): void {

  // Basic validation
  if (!this.forgotOtp.trim()) {

    this.forgotError =
      'Please enter the OTP.';

    return;
  }

  if (!/^\d{6}$/.test(this.forgotOtp.trim())) {

    this.forgotError =
      'Please enter a valid 6-digit OTP.';

    return;
  }

  this.forgotError = '';
  this.forgotMessage = '';
  this.forgotLoading = true;

  this.authService
    .verifyForgotPasswordOtp(
      this.forgotEmail.trim(),
      this.forgotOtp.trim()
    )
    .subscribe({

      next: (res: any) => {

        this.forgotLoading = false;

        if (res?.success) {

          this.forgotOtpVerified = true;

          this.forgotMessage =
            'OTP verified successfully.';

          // Stop countdown after successful verification
          if (this.forgotOtpTimerInterval) {

            clearInterval(
              this.forgotOtpTimerInterval
            );

            this.forgotOtpTimerInterval = null;

          }

          // Next screen will be added next
          this.forgotStep = 3;

        } else {

          this.forgotError =
            res?.message ||
            'Unable to verify OTP.';

        }

      },

      error: (error) => {

        this.forgotLoading = false;

        this.forgotError =
          error?.error?.message ||
          'Incorrect or expired OTP. Please try again.';

      }

    });

}

resetForgotPassword(): void {

  this.forgotError = '';
  this.forgotMessage = '';

  // OTP verification check
  if (!this.forgotOtpVerified) {

    this.forgotError =
      'Please verify the OTP first.';

    return;
  }

  // New password validation
  if (!this.forgotNewPassword) {

    this.forgotError =
      'Please enter a new password.';

    return;
  }

  // Minimum password length
  if (this.forgotNewPassword.length < 6) {

    this.forgotError =
      'Password must be at least 6 characters.';

    return;
  }

  // Confirm password validation
  if (!this.forgotConfirmPassword) {

    this.forgotError =
      'Please confirm your new password.';

    return;
  }

  // Password match
  if (
    this.forgotNewPassword !==
    this.forgotConfirmPassword
  ) {

    this.forgotError =
      'Passwords do not match.';

    return;
  }

this.forgotLoading = true;

this.authService
  .resetForgotPassword(
    this.forgotEmail.trim(),
    this.forgotNewPassword
  )
  .subscribe({

    next: (res: any) => {

      this.forgotLoading = false;

      if (res?.success) {

        this.forgotMessage =
          'Password updated successfully. You can now login with your new password.';

        this.forgotError = '';

        // Login page par wapas bhejne se pehle
        // email automatically fill kar do
        this.loginData.email =
          this.forgotEmail.trim();

        this.loginData.password = '';

        setTimeout(() => {

          this.closeForgotPassword();

          this.activeTab = 'login';

        }, 1500);

      } else {

        this.forgotError =
          res?.message ||
          'Unable to update password.';

      }

    },

    error: (error) => {

      this.forgotLoading = false;

      this.forgotError =
        error?.error?.message ||
        'Unable to update password. Please try again.';

    }

  });

  
}


}
