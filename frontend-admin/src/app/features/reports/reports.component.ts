import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AdminI18nService } from '../../core/services/admin-i18n.service';

interface RankedItem {
  slug?: string;
  id?: string;
  url?: string;
  title: string;
  value: number;
}

interface Reports {
  totals: {
    pageViews: number;
    articleViews: number;
    projectViews: number;
    articles: number;
    projects: number;
    likes: number;
  };
  topPages: { url: string; count: number }[];
  articles: {
    topLiked: { slug: string; title: string; likeCount: number }[];
    topViewed: { slug: string; title: string; views: number }[];
  };
  projects: {
    topViewed: { id: string; title: string; views: number }[];
  };
  daily: DailyStat[];
}

interface DailyStat {
  date: string;
  count: number;
}

@Component({
  selector: 'app-reports',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  reports = signal<Reports | null>(null);
  loading = signal(true);
  selectedDays = signal<7 | 30 | 90>(30);
  visibleDailyRows = signal(10);

  constructor(private http: HttpClient, public i18n: AdminI18nService) {}

  ngOnInit(): void {
    this.http.get<Reports>('/api/analytics/reports?days=30').subscribe({
      next: (data) => {
        this.reports.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Maps a tracked route path to a localized page name (reused from the dashboard pattern). */
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

  maxValue(items: RankedItem[]): number {
    return items.reduce((max, item) => Math.max(max, item.value), 0);
  }

  activeDays(r: Reports): DailyStat[] {
    return r.daily.filter((day) => day.count > 0);
  }

  /** Most recent active days first; zero-view days remain available in the API response. */
  dailyRows(r: Reports): DailyStat[] {
    return this.activeDays(r)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, this.visibleDailyRows());
  }

  hasMoreDailyRows(r: Reports): boolean {
    return this.activeDays(r).length > this.visibleDailyRows();
  }

  dailyMax(r: Reports): number {
    return Math.max(...this.activeDays(r).map((day) => day.count), 1);
  }

  selectDailyRange(days: 7 | 30 | 90): void {
    if (days === this.selectedDays()) return;
    this.selectedDays.set(days);
    this.visibleDailyRows.set(10);
    this.http.get<Reports>(`/api/analytics/reports?days=${days}`).subscribe({
      next: (data) => {
        this.reports.update((current) => current ? { ...current, daily: data.daily } : data);
      },
    });
  }

  showMoreDailyRows(): void {
    this.visibleDailyRows.update((count) => count + 10);
  }

  formatDailyDate(value: string): string {
    return new Intl.DateTimeFormat(this.i18n.isFa ? 'fa-IR' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    }).format(new Date(value));
  }

  peakDay(r: Reports): DailyStat | null {
    if (!r.daily.length) return null;
    return r.daily.reduce((peak, day) => (day.count > peak.count ? day : peak));
  }

  topPagesItems(r: Reports): RankedItem[] {
    return r.topPages.map((p) => ({ title: this.pageLabel(p.url), value: p.count, url: p.url }));
  }

  topLikedItems(r: Reports): RankedItem[] {
    return r.articles.topLiked.map((a) => ({ slug: a.slug, title: a.title, value: a.likeCount }));
  }

  topViewedArticlesItems(r: Reports): RankedItem[] {
    return r.articles.topViewed.map((a) => ({ slug: a.slug, title: a.title, value: a.views }));
  }

  topViewedProjectsItems(r: Reports): RankedItem[] {
    return r.projects.topViewed.map((p) => ({ id: p.id, title: p.title, value: p.views }));
  }
}
