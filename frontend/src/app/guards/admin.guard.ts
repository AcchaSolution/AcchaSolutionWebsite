import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);

  // ==========================================
  // ADMIN AUTH DATA
  // ==========================================

  const token =
    localStorage.getItem('authToken');

  const adminEmail =
    localStorage
      .getItem('adminEmail')
      ?.trim()
      .toLowerCase();

  const adminLoggedIn =
    localStorage.getItem('adminLoggedIn') === 'true';


  // ==========================================
  // ONLY THIS ADMIN IS ALLOWED
  // ==========================================

  const isAuthorizedAdmin =
    !!token &&
    adminLoggedIn &&
    adminEmail === 'tanubanglore35@gmail.com';


  // ==========================================
  // ACCESS GRANTED
  // ==========================================

  if (isAuthorizedAdmin) {
    return true;
  }


  // ==========================================
  // ACCESS DENIED
  // ==========================================

  // Remove any incomplete/invalid admin session
  localStorage.removeItem('authToken');
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminEmail');

  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');


  // Send user to login
  return router.createUrlTree(
    ['/login'],
    {
      queryParams: {
        returnUrl: state.url
      }
    }
  );
};