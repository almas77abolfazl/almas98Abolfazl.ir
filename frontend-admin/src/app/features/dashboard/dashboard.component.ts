import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';

interface DailyStat {
  date: string;
  count: number;
}

interface TopPage {
  url: string;
  count: number;
}

interface ChartPoint {
  pctX: number;
  pctY: number;
  date: string;
  count: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styles: [],
})
export class DashboardComponent implements OnInit {
  messageCount = 0;
  pendingCount = 0;
  articleCount = 0;
  totalViews = 0;
  topPages: TopPage[] = [];
  daily: DailyStat[] = [];

  constructor(private http: HttpClient, public i18n: AdminI18nService) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/admin/contact-messages').subscribe({
      next: (data) => (this.messageCount = data.length),
    });
    this.http.get<any[]>('/api/admin/testimonials').subscribe({
      next: (data) => (this.pendingCount = data.filter((t) => t.status === 'PENDING').length),
    });
    this.http.get<any[]>('/api/admin/articles').subscribe({
      next: (data) => (this.articleCount = data.length),
    });
    this.http.get<any>('/api/analytics/stats').subscribe({
      next: (data) => {
        this.totalViews = data.total;
        this.topPages = data.topPages;
        this.daily = data.daily;
      },
    });
  }

  get maxDaily(): number {
    return this.daily.length ? Math.max(...this.daily.map((d) => d.count), 1) : 1;
  }

  get maxTop(): number {
    return this.topPages.length ? Math.max(...this.topPages.map((p) => p.count), 1) : 1;
  }

  get totalDaily(): number {
    return this.daily.reduce((sum, d) => sum + d.count, 0);
  }

  get avgDaily(): number {
    return this.daily.length ? Math.round(this.totalDaily / this.daily.length) : 0;
  }

  get peakDay(): DailyStat | null {
    if (!this.daily.length) return null;
    return this.daily.reduce((a, b) => (b.count > a.count ? b : a));
  }

  /** Normalised points for an SVG area chart (viewBox 0..100, y grows downward). */
  get chartPoints(): ChartPoint[] {
    const n = this.daily.length;
    if (!n) return [];
    const max = this.maxDaily;
    return this.daily.map((d, i) => ({
      pctX: n === 1 ? 50 : (i / (n - 1)) * 100,
      pctY: (d.count / max) * 100,
      date: d.date,
      count: d.count,
    }));
  }

  get linePath(): string {
    return this.chartPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.pctX.toFixed(2)} ${(100 - p.pctY).toFixed(2)}`)
      .join(' ');
  }

  get areaPath(): string {
    const pts = this.chartPoints;
    if (!pts.length) return '';
    return `${this.linePath} L ${pts[pts.length - 1].pctX.toFixed(2)} 100 L ${pts[0].pctX.toFixed(2)} 100 Z`;
  }

  topPageWidth(count: number): number {
    return (count / this.maxTop) * 100;
  }

  /** Maps a tracked route path to a friendly, localized page name for the Top Pages list. */
  pageLabel(url: string): string {
    const path = (url.split('?')[0] || '').replace(/\/+$/, '') || '/';
    const map: Record<string, string> = {
      '/': 'page_home',
      '/about-me': 'nav_about',
      '/experiences': 'nav_experiences',
      '/skills': 'nav_skills',
      '/blog': 'page_blog',
      '/videos': 'nav_videos',
      '/projects': 'nav_projects',
      '/contact': 'nav_contact',
      '/404': 'page_notFound',
    };
    if (map[path]) return this.i18n.t(map[path]);
    const articleMatch = path.match(/^\/blog\/(.+)$/);
    if (articleMatch) return `${this.i18n.t('page_article')} · ${articleMatch[1]}`;
    return url;
  }

  axisLabels(): DailyStat[] {
    if (!this.daily.length) return [];
    const step = Math.max(1, Math.ceil(this.daily.length / 6));
    const labels: DailyStat[] = [];
    for (let i = 0; i < this.daily.length; i += step) {
      labels.push(this.daily[i]);
    }
    if (labels[labels.length - 1] !== this.daily[this.daily.length - 1]) {
      labels.push(this.daily[this.daily.length - 1]);
    }
    return labels;
  }
}
