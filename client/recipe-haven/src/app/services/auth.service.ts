import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../interfaces/common.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  public userId: string = '';
  constructor(private http: HttpClient) {
    // Retrieve userId from localStorage on service initialization
    const token = this.getAuthToken();
    if (token) {
      this.setUserIdFromToken(token);
    }
  }

  private setUserIdFromToken(token: string) {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      this.userId = decodedToken.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      this.userId = '';
    }
  }

  signup(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, { username, password }).pipe(
      tap((response) => {
        console.log('Signup successful:', response);
      }),
      catchError(this.handleError)
    );
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/signin`, { username, password }).pipe(
      tap((response) => {
        console.log('Login successful:', response);
      }),
      catchError(this.handleError)
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); // temporary
  }

  logout() {
    localStorage.removeItem('token');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string {
    return this.userId;
  }

  private handleError(error: any): Observable<never> {
    console.error('API error:', error);
    return throwError(() => error);
  }
}
