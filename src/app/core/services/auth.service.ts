import { Injectable, signal } from '@angular/core';

const AUTH_STORAGE_KEY = 'peopleflow-authenticated';
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'Admin123!';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticated = signal(this.readSession());
  readonly isAuthenticated = this.authenticated.asReadonly();

  login(username: string, password: string): boolean {
    const isValid = username.trim() === DEMO_USERNAME && password === DEMO_PASSWORD;

    if (!isValid) {
      return false;
    }

    this.writeSession(true);
    this.authenticated.set(true);
    return true;
  }

  logout(): void {
    this.writeSession(false);
    this.authenticated.set(false);
  }

  private readSession(): boolean {
    try {
      return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private writeSession(isAuthenticated: boolean): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        if (isAuthenticated) {
          sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
        } else {
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch {
    }
  }
}
