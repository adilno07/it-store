import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'auth_token';

  isLoggedIn = signal<boolean>(this.hasToken());
  userRole = signal<string | null>(localStorage.getItem('user_role'));

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap((response) => this.setSession(response)));
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem('user_email', response.email);
    localStorage.setItem('user_firstName', response.firstName);
    localStorage.setItem('user_role', response.role);
    this.isLoggedIn.set(true);
    this.userRole.set(response.role);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_firstName');
    localStorage.removeItem('user_role');
    this.isLoggedIn.set(false);
    this.userRole.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserFirstName(): string | null {
    return localStorage.getItem('user_firstName');
  }

  isAdmin(): boolean {
    return this.userRole() === 'ADMIN';
  }
}
