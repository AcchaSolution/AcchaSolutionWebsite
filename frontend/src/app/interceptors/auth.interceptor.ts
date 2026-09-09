import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Local storage se JWT token nikalein
  const token = localStorage.getItem('authToken');

  // Agar token milta hai, toh request ke header mein Bearer token jodh dein
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  // Agar token nahi hai, toh request ko waise hi bhej dein
  return next(req);
};