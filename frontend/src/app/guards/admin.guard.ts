import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  const adminEmail = localStorage.getItem('adminEmail');

  if (isAdminLoggedIn || adminEmail?.toLowerCase() === 'tanubanglore35@gmail.com') {
    return true;
  }

  // Agar admin nahi hai, toh admin login page par redirect kar dein
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};