import { Injectable, signal, inject, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface CustomerAuthResponse {
  token: string;
  customerId: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface CustomerLoginRequest {
  email: string;
  password: string;
}

interface CustomerRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerAuth {
  private apiUrl = 'http://localhost:8080/api/public/auth';
  private tokenKey = 'customer_token';
  private injector = inject(Injector);

  isLoggedIn = signal<boolean>(this.hasToken());
  customerFirstName = signal<string | null>(localStorage.getItem('customer_firstName'));
  customerId = signal<number | null>(this.readStoredId());

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private readStoredId(): number | null {
    const raw = localStorage.getItem('customer_id');
    return raw ? Number(raw) : null;
  }

  login(credentials: CustomerLoginRequest): Observable<CustomerAuthResponse> {
    return this.http
      .post<CustomerAuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap((response) => this.setSession(response)));
  }

  register(data: CustomerRegisterRequest): Observable<CustomerAuthResponse> {
    return this.http
      .post<CustomerAuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(tap((response) => this.setSession(response)));
  }

  private setSession(response: CustomerAuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem('customer_id', String(response.customerId));
    localStorage.setItem('customer_email', response.email);
    localStorage.setItem('customer_firstName', response.firstName);
    this.isLoggedIn.set(true);
    this.customerFirstName.set(response.firstName);
    this.customerId.set(response.customerId);

    // Chargement différé pour éviter une dépendance circulaire au démarrage
    import('./favorites').then(({ Favorites }) => {
      this.injector.get(Favorites).loadFavorites();
    });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('customer_id');
    localStorage.removeItem('customer_email');
    localStorage.removeItem('customer_firstName');
    this.isLoggedIn.set(false);
    this.customerFirstName.set(null);
    this.customerId.set(null);

    import('./favorites').then(({ Favorites }) => {
      this.injector.get(Favorites).clear();
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCustomerId(): number | null {
    return this.customerId();
  }
}
