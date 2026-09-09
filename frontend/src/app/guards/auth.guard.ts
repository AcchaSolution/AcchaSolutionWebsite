import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');

  // Check karein ki user ke paas valid JWT token hai ya nahi
  if (token) {
    return true; // Access granted
  }

  // Agar token nahi hai, toh login page par redirect kar dein
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
