import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private hasTracked = new Set<string>();
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private http: HttpClient) {}

  track(url: string): void {
    if (!this.isBrowser) {
      return;
    }
    if (this.isAdmin()) {
      return;
    }
    const key = `${url}`;
    if (this.hasTracked.has(key)) {
      return;
    }
    this.hasTracked.add(key);
    this.http.post('/api/analytics/track', { url }).subscribe();
  }

  private isAdmin(): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === '1' || params.get('no_track') === '1') {
        localStorage.setItem('isAdmin', 'true');
        return true;
      }

      if (localStorage.getItem('token') || localStorage.getItem('isAdmin') === 'true') {
        return true;
      }

      if (document.cookie.split(';').some((item) => item.trim().startsWith('is_admin=1'))) {
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }
}
