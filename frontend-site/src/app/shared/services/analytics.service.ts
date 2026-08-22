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
    const key = `${url}`;
    if (this.hasTracked.has(key)) {
      return;
    }
    this.hasTracked.add(key);
    this.http.post('/api/analytics/track', { url }).subscribe();
  }
}
