import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { catchError, of, tap } from 'rxjs';
import { User } from '../../../models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  currentUser = signal<User | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        this.fetchCurrentUser();
      }
    }
  }

  fetchCurrentUser() {
    this.http.get<User>(`${this.apiUrl}/users/me`).pipe(
      catchError((err) => {
        console.error('Błąd pobierania /me:', err);
        this.logout();
        return of(null);
      })
    ).subscribe(user => {
      if (user) {
        if (!user.avatarUrl) {
          user.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;
        }
        this.currentUser.set(user);
      }
    });
  }

  getUserById(id: number) {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`).pipe(
      tap(u => {
        if (u && !u.avatarUrl) {
          u.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`;
        }
      })
    );
  }

  loginWithCredentials(email: string, password?: string) {
    return this.http.post<{token: string}>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          this.fetchCurrentUser();
        }
      })
    );
  }

  verify(email: string, code: string) {
    return this.http.post(`${this.apiUrl}/auth/verify`, { email, code }, { responseType: 'text' });
  }

  resendVerification(email: string) {
    return this.http.post(`${this.apiUrl}/auth/resend-verification`, { email }, { responseType: 'text' });
  }

  register(name: string, email: string, password?: string) {
    const payload = { name, email, password, passwordRepeated: password };
    return this.http.post<User>(`${this.apiUrl}/auth/register`, payload);
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  updateUser(data: Partial<User>) {
    const payload = {
      name: data.name,
      email: data.email,
      emailRepeated: data.email || this.currentUser()?.email,
      description: data.description,
      avatarUrl: data.avatarUrl
    };
    return this.http.put<User>(`${this.apiUrl}/users/me`, payload).pipe(
      tap(updatedUser => {
        if (updatedUser) {
          this.currentUser.set(updatedUser);
        }
      }),
      catchError((err) => {
        console.error('Błąd profilu:', err);
        return of(null);
      })
    );
  }
}
