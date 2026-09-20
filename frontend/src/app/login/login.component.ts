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

  showPassword = false;

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
}
