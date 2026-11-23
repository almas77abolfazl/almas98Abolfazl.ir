import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';

  constructor(private router: Router) {
    if (this.isLoggedIn()) {
      this.setAdminCookie(true);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('isAdmin', 'true');
      }
    }
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem('isAdmin', 'true');
    this.setAdminCookie(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** True only when a token exists and has not expired (best-effort client check). */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('isAdmin');
    this.setAdminCookie(false);
    this.router.navigate(['/login']);
  }

  private setAdminCookie(enable: boolean): void {
    if (typeof document === 'undefined') return;
    const maxAge = enable ? 31536000 : 0;
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isProd = hostname.endsWith('almas98abolfazl.ir');
    const securePart = isHttps ? '; Secure' : '';

    if (isProd) {
      document.cookie = `is_admin=${enable ? '1' : ''}; path=/; max-age=${maxAge}; domain=.almas98abolfazl.ir${securePart}; SameSite=Lax`;
    }
    document.cookie = `is_admin=${enable ? '1' : ''}; path=/; max-age=${maxAge}${securePart}; SameSite=Lax`;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload.exp) {
        return false;
      }
      return Date.now() >= payload.exp * 1000;
    } catch {
      // Malformed token — treat as invalid so the user is forced to re-authenticate.
      return true;
    }
  }

  private decodeToken(token: string): { exp?: number } {
    const part = token.split('.')[1];
    if (!part) {
      throw new Error('Invalid token');
    }
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = new TextDecoder().decode(
      Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)),
    );
    return JSON.parse(json) as { exp?: number };
  }
}
