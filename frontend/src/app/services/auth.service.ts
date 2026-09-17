import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { enviroment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  // =========================================================
  // NODE.JS + MONGODB BACKEND
  // =========================================================

  private apiUrl =
enviroment?.apiUrl || 'https://api.acchasolution.com/api/auth';
  // =========================================================
  // LOGIN STATE
  // =========================================================

  private loggedInStatus = false;

  private emailSource =
    new BehaviorSubject<string>(
      localStorage.getItem('userEmail') || ''
    );

  currentUserEmail =
    this.emailSource.asObservable();


  // =========================================================
  // 1. NORMAL USER LOGIN
  // =========================================================

  loginUser(credentials: any): Observable<any> {

    return this.http
      .post(
        `${this.apiUrl}/login`,
        credentials
      )
      .pipe(

        tap((res: any) => {

          if (
            res &&
            res.success &&
            res.token
          ) {

            // JWT TOKEN
            localStorage.setItem(
              'authToken',
              res.token
            );


            // COMPLETE USER DATA
            if (res.user) {

              localStorage.setItem(
                'user',
                JSON.stringify(res.user)
              );


              // USER NAME
              if (res.user.name) {

                localStorage.setItem(
                  'userName',
                  res.user.name
                );

              }


              // USER EMAIL
              if (res.user.email) {

                localStorage.setItem(
                  'userEmail',
                  res.user.email
                );

                this.emailSource.next(
                  res.user.email
                );

              }


              // =================================================
              // ADMIN
              // =================================================

              if (
                res.user.role === 'admin'
              ) {

                localStorage.setItem(
                  'adminLoggedIn',
                  'true'
                );

                localStorage.setItem(
                  'adminEmail',
                  res.user.email || ''
                );

                localStorage.removeItem(
                  'publicUserLoggedIn'
                );

              }

              // =================================================
              // NORMAL USER
              // =================================================

              else {

                localStorage.setItem(
                  'publicUserLoggedIn',
                  'true'
                );

                localStorage.removeItem(
                  'adminLoggedIn'
                );

                localStorage.removeItem(
                  'adminEmail'
                );

              }

            }

            this.loggedInStatus = true;

          }

        })

      );

  }

getAllUsers() {

  return this.http.get<any>(
  'https://api.acchasolution.com/api/auth/users'
 );

}


// =========================================================
// GET APPROVED AGENTS - PUBLIC AGENT PAGE
// =========================================================

getApprovedAgents(): Observable<any> {

  return this.http.get<any>(
    `${this.apiUrl}/approved-agents`
  );

}


// =========================================================
// GET SINGLE APPROVED AGENT
// =========================================================

getApprovedAgent(agentId: string): Observable<any> {

  return this.http.get<any>(
    `${this.apiUrl}/approved-agents/${agentId}`
  );

}


approveAgent(agentId: string): Observable<any> {

  return this.http.put(
    `${this.apiUrl}/approve/${agentId}`,
    {}
  );

}

// =========================================================
// REVOKE AGENT APPROVAL
// =========================================================

revokeAgentApproval(agentId: string): Observable<any> {
  console.log('REVOKE APPROVAL SERVICE ID:', agentId);

  return this.http.put<any>(
    `${this.apiUrl}/revoke/${agentId}`,
    {}
  );
}

// =========================================================
// DELETE AGENT
// =========================================================

deleteAgent(agentId: string): Observable<any> {

  console.log(
    'DELETE SERVICE ID:',
    agentId
  );

  return this.http.delete<any>(
    `${this.apiUrl}/delete/${agentId}`
  );

}

// =========================================================
  // 2. USER SIGNUP
  // =========================================================

  signup(userData: any): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/signup`,
      userData
    );

  }


  // =========================================================
  // 3. GOOGLE LOGIN
  // =========================================================
  //
  // Backend Google login abhi complete nahi kiya hai.
  // Method rakha gaya hai taaki existing files me error na aaye.
  //
  // =========================================================

  googleLogin(
    data: { token: string }
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/google-login`,
      data
    ).pipe(

      tap((res: any) => {

        if (
          res &&
          res.success &&
          res.token
        ) {

          localStorage.setItem(
            'authToken',
            res.token
          );


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
              res.user.email || ''
            );

            this.emailSource.next(
              res.user.email || ''
            );


            if (
              res.user.role === 'admin'
            ) {

              localStorage.setItem(
                'adminLoggedIn',
                'true'
              );

              localStorage.setItem(
                'adminEmail',
                res.user.email || ''
              );

            } else {

              localStorage.setItem(
                'publicUserLoggedIn',
                'true'
              );

            }

          }

          this.loggedInStatus = true;

        }

      })

    );

  }


  // =========================================================
  // 4. OTP MANAGEMENT
  // =========================================================
  //
  // Existing files ke liye methods rakhe hain.
  // Inke backend routes hum baad me banayenge.
  //
  // =========================================================

  sendOtp(
    email: string
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/send-otp`,
      { email }
    );

  }


  verifyOtp(
    email: string,
    otp: string
  ): Observable<any> {

    return this.http
      .post(
        `${this.apiUrl}/verify-otp`,
        {
          email,
          otp
        }
      )
      .pipe(

        tap((res: any) => {

          if (
            res &&
            res.token
          ) {

            localStorage.setItem(
              'authToken',
              res.token
            );

            localStorage.setItem(
              'publicUserLoggedIn',
              'true'
            );

            if (res.name) {

              localStorage.setItem(
                'userName',
                res.name
              );

            }

            this.updateEmail(
              res.email || email
            );

            this.loggedInStatus = true;

          }

        })

      );

  }


  // =========================================================
  // 5. CHECK USER STATUS
  // =========================================================

  checkUserStatus(
    email: string
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/check-status`,
      { email }
    );

  }


  // =========================================================
  // 6. UPDATE EMAIL
  // =========================================================

  updateEmail(
    email: string
  ): void {

    localStorage.setItem(
      'userEmail',
      email
    );

    this.emailSource.next(
      email
    );

  }


  // =========================================================
  // 7. CHECK LOGIN
  // =========================================================

  isLoggedIn(): boolean {

    return !!this.getToken();

  }


  // =========================================================
  // 8. PUBLIC USER LOGIN
  // =========================================================

  isPublicUserLoggedIn(): boolean {

    return (
      localStorage.getItem(
        'publicUserLoggedIn'
      ) === 'true'
    );

  }


  // =========================================================
  // 9. ADMIN LOGIN
  // =========================================================

  isAdminLoggedIn(): boolean {

    return (
      localStorage.getItem(
        'adminLoggedIn'
      ) === 'true'
    );

  }


  // =========================================================
  // 10. GET TOKEN
  // =========================================================

  getToken(): string | null {

    return localStorage.getItem(
      'authToken'
    );

  }


  // =========================================================
  // 11. GET USER
  // =========================================================

  getUser(): any {

    const user =
      localStorage.getItem('user');

    if (!user) {
      return null;
    }

    try {

      return JSON.parse(user);

    } catch {

      return null;

    }

  }


  // =========================================================
  // 12. GET USER EMAIL
  // =========================================================

  getUserEmail(): string {

    return (
      localStorage.getItem(
        'userEmail'
      ) || ''
    );

  }


  // =========================================================
  // 13. GET USER NAME
  // =========================================================

  getUserName(): string {

    return (
      localStorage.getItem(
        'userName'
      ) || ''
    );

  }


  // =========================================================
  // 14. LOGOUT
  // =========================================================

  logout(): void {

    localStorage.removeItem(
      'userEmail'
    );

    localStorage.removeItem(
      'userName'
    );

    localStorage.removeItem(
      'authToken'
    );

    localStorage.removeItem(
      'user'
    );

    localStorage.removeItem(
      'publicUserLoggedIn'
    );

    localStorage.removeItem(
      'adminLoggedIn'
    );

    localStorage.removeItem(
      'adminEmail'
    );


    this.emailSource.next('');

    this.loggedInStatus = false;

  }

}