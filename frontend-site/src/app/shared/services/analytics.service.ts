import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private hasTracked = new Set<string>();

  constructor(private http: HttpClient) {}

  track(url: string): void {
    const key = `${url}`;
    if (this.hasTracked.has(key)) {
      return;
    }
    this.hasTracked.add(key);
    this.http.post('/api/analytics/track', { url }).subscribe();
  }
}
