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

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="admin-title mb-6">{{ i18n.t('nav_dashboard') }}</h1>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div class="admin-stat">
          <div class="admin-stat-icon">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ i18n.t('dash_messages') }}</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ messageCount }}</p>
          </div>
        </div>

        <div class="admin-stat">
          <div class="admin-stat-icon">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10H5a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2zm0 0h2a2 2 0 002-2v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2a2 2 0 002 2zm0 0v6a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2H8z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ i18n.t('dash_pending') }}</p>
            <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ pendingCount }}</p>
          </div>
        </div>

        <div class="admin-stat">
          <div class="admin-stat-icon">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ i18n.t('dash_views') }}</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ totalViews }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="admin-card">
          <h2 class="mb-4 text-lg font-bold text-slate-900 dark:text-white">{{ i18n.t('dash_topPages') }}</h2>
          <div class="space-y-3">
            @for (page of topPages; track page.url) {
              <div class="flex items-center justify-between">
                <span class="truncate text-slate-700 dark:text-slate-300 mr-4">{{ page.url }}</span>
                <span class="font-semibold text-slate-900 dark:text-white">{{ page.count }}</span>
              </div>
            }
            @if (!topPages.length) {
              <div class="text-slate-500 dark:text-slate-400">{{ i18n.t('noData') }}</div>
            }
          </div>
        </div>

        <div class="admin-card">
          <h2 class="mb-4 text-lg font-bold text-slate-900 dark:text-white">{{ i18n.t('dash_dailyTraffic') }}</h2>
          <div class="flex h-48 items-end gap-1">
            @for (day of daily; track day.date) {
              <div class="flex flex-1 flex-col items-center">
                <div class="w-full rounded-t bg-linear-to-t from-indigo-600 to-violet-400" [style.height.%]="getBarHeight(day.count)"></div>
                <span class="mt-1 w-full truncate text-center text-[10px] text-slate-500 dark:text-slate-400">{{ day.date | date:'MM/dd' }}</span>
              </div>
            }
            @if (!daily.length) {
              <div class="w-full text-center text-slate-500 dark:text-slate-400">{{ i18n.t('noData') }}</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
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

  getBarHeight(count: number): number {
    if (!this.daily.length) return 0;
    const max = Math.max(...this.daily.map(d => d.count), 1);
    return (count / max) * 100;
  }
}
