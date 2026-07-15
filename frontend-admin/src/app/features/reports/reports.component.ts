import { Component, OnInit, signal } from '@angular/core';
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
  daily: { date: Date; count: number }[];
}

@Component({
  selector: 'app-reports',
  imports: [CommonModule, RouterLink],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  reports = signal<Reports | null>(null);
  loading = signal(true);

  constructor(private http: HttpClient, public i18n: AdminI18nService) {}

  ngOnInit(): void {
    this.http.get<Reports>('/api/analytics/reports').subscribe({
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
