import { CommonModule } from '@angular/common';

import {
  Component,
  HostListener,
  OnInit
} from '@angular/core';

import {
  Router,
  RouterModule
} from '@angular/router';

import { AuthService } from '../services/auth.service';

import { SharedService } from '../services/shared.service';
// import { Auth } from '@angular/fire/auth';

import {
  map,
  Observable
} from 'rxjs';


@Component({
  selector: 'app-navbar',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule
  ],

  templateUrl: './navbar.component.html',

  styleUrl: './navbar.component.css'
})


export class NavbarComponent implements OnInit {


  userInitial: string = '';

  userInitial$: Observable<string>;

  userName$: Observable<string>;

  userEmail$: Observable<string>;

  isDropdownOpen: boolean = false;


  // =========================================================
  // PROFILE FIRST LETTER
  // NAME FIRST → EMAIL FALLBACK
  // =========================================================

  profileInitial: string = '';


  isMobileMenuOpen = false;

  mobileSaleOpen = false;

  mobileRentOpen = false;

  mobileServicesOpen = false;


  constructor(

    private router: Router,

    // private auth: Auth,

    public authService: AuthService,

    private sharedService: SharedService

  ) {


    this.userInitial$ =

      this.authService.currentUserEmail.pipe(

        map(email => {

          if (!email) {

            return '';

          }

          return email
            .charAt(0)
            .toUpperCase();

        })

      );


    this.userEmail$ =

      this.authService.currentUserEmail;


    this.userName$ =

      this.authService.currentUserEmail.pipe(

        map(email => {

          if (!email) {

            return '';

          }


          const savedName =
            localStorage.getItem('userName');


          if (savedName) {

            return savedName;

          }


          const emailName =
            email.split('@')[0];


          return emailName

            .replace(
              /[._-]+/g,
              ' '
            )

            .replace(
              /\b\w/g,
              char => char.toUpperCase()
            );

        })

      );

  }


  // =========================================================
  // ADMIN AREA
  // =========================================================

  isAdminArea(): boolean {

    const currentUrl =
      this.router.url.split('?')[0];


    return (

      currentUrl === '/dashboard' ||

      currentUrl.startsWith(
        '/dashboard/'
      )

    );

  }


  isAdminLoggedIn(): boolean {

    return (

      localStorage.getItem(
        'adminLoggedIn'
      ) === 'true'

    );

  }


  // =========================================================
  // PUBLIC USER LOGIN
  // =========================================================

  isPublicUserLoggedIn(): boolean {

    const email =

      localStorage
        .getItem('userEmail')
        ?.trim();


    const loggedInFlag =

      localStorage.getItem(
        'publicUserLoggedIn'
      ) === 'true';


    return !!email || loggedInFlag;

  }


  // =========================================================
  // ADMIN NAME
  // =========================================================

  getAdminName(): string {

    const savedAdminName =
      localStorage.getItem('adminName');


    if (savedAdminName) {

      return savedAdminName;

    }


    const email =
      localStorage.getItem('adminEmail');


    if (!email) {

      return 'Admin';

    }


    const emailName =
      email.split('@')[0];


    return emailName

      .replace(
        /[._-]+/g,
        ' '
      )

      .replace(
        /\b\w/g,
        char => char.toUpperCase()
      );

  }


  // =========================================================
  // ADMIN INITIAL
  // =========================================================

  getAdminInitial(): string {

    const name =
      this.getAdminName();


    if (!name) {

      return 'A';

    }


    return name
      .charAt(0)
      .toUpperCase();

  }


  // =========================================================
  // ADMIN EMAIL
  // =========================================================

  getAdminEmail(): string {

    return (

      localStorage.getItem(
        'adminEmail'
      ) || ''

    );

  }


  // =========================================================
  // ON INIT
  // =========================================================

  ngOnInit(): void {

    this.authService.currentUserEmail.subscribe(
      email => {

        const savedName =
          localStorage
            .getItem('userName')
            ?.trim();

        const savedEmail =
          localStorage
            .getItem('userEmail')
            ?.trim();


        if (savedName) {

          this.userInitial =
            savedName
              .charAt(0)
              .toUpperCase();

          this.profileInitial =
            savedName
              .charAt(0)
              .toUpperCase();

        }

        else if (savedEmail) {

          this.userInitial =
            savedEmail
              .charAt(0)
              .toUpperCase();

          this.profileInitial =
            savedEmail
              .charAt(0)
              .toUpperCase();

        }

        else if (email) {

          this.userInitial =
            email
              .charAt(0)
              .toUpperCase();

          this.profileInitial =
            email
              .charAt(0)
              .toUpperCase();

        }

        else {

          this.userInitial = '';

          this.profileInitial = '';

        }

      }
    );

  }


  // =========================================================
  // POST PROPERTY
  // =========================================================

  goToPostProperty(): void {

    this.router.navigate([
      '/post-property'
    ]);

  }


  // =========================================================
  // DROPDOWN
  // =========================================================

  toggleDropdown(
    event?: Event
  ): void {

    if (event) {

      event.stopPropagation();

    }


    this.isDropdownOpen =
      !this.isDropdownOpen;

  }


  // =========================================================
  // DOCUMENT CLICK
  // =========================================================

  @HostListener(
    'document:click',
    ['$event']
  )

  onDocumentClick(
    event: MouseEvent
  ): void {

    this.isDropdownOpen = false;

  }


  // =========================================================
  // LOGOUT
  // =========================================================

  async onLogout(): Promise<void> {

    try {

      this.isDropdownOpen = false;


      await this.authService.logout();


      await this.router.navigate([
        '/'
      ]);

    }

    catch (error) {

      console.error(
        'Logout failed:',
        error
      );

    }

  }


  // =========================================================
  // MOBILE MENU
  // =========================================================

  toggleMobileMenu(): void {

    this.isMobileMenuOpen =
      !this.isMobileMenuOpen;


    if (this.isMobileMenuOpen) {

      document.body.classList.add(
        'mobile-menu-active'
      );

    }

    else {

      document.body.classList.remove(
        'mobile-menu-active'
      );

    }

  }


  // =========================================================
  // MOBILE SECTIONS
  // =========================================================

  toggleMobileSection(
    section:
      'sale' |
      'rent' |
      'services'
  ): void {


    if (
      section === 'sale'
    ) {

      this.mobileSaleOpen =
        !this.mobileSaleOpen;

      this.mobileRentOpen =
        false;

      this.mobileServicesOpen =
        false;

    }


    if (
      section === 'rent'
    ) {

      this.mobileRentOpen =
        !this.mobileRentOpen;

      this.mobileSaleOpen =
        false;

      this.mobileServicesOpen =
        false;

    }


    if (
      section === 'services'
    ) {

      this.mobileServicesOpen =
        !this.mobileServicesOpen;

      this.mobileSaleOpen =
        false;

      this.mobileRentOpen =
        false;

    }

  }


  // =========================================================
  // CLOSE MOBILE MENU
  // =========================================================

  closeMobileMenu(): void {

    this.isMobileMenuOpen =
      false;


    this.mobileSaleOpen =
      false;

    this.mobileRentOpen =
      false;

    this.mobileServicesOpen =
      false;


    document.body.classList.remove(
      'mobile-menu-active'
    );

  }


}
