import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    if (username === 'test' && password === 'password') {
      return of({ token: 'mock-token' }).pipe(
        tap(() => {
          console.log('login successful');
        })
      );
    } else {
      return of(null).pipe(
        tap(() => {
          console.log('login failed');
        }),
        catchError((error) => {
          console.error('Login error:', error);
          throw error;
        })
      );
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); // temporary
  }
}
