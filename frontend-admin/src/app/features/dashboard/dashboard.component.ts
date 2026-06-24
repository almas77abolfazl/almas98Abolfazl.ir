import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-gray-500 dark:text-gray-400 text-sm">Total Messages</h3>
          <p class="text-3xl font-bold text-gray-800 dark:text-white">{{ messageCount }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-gray-500 dark:text-gray-400 text-sm">Pending Testimonials</h3>
          <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{{ pendingCount }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-gray-500 dark:text-gray-400 text-sm">Total Page Views</h3>
          <p class="text-3xl font-bold text-gray-800 dark:text-white">{{ totalViews }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Top Pages</h2>
          <div class="space-y-3">
            <div *ngFor="let page of topPages" class="flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300 truncate mr-4">{{ page.url }}</span>
              <span class="text-gray-900 dark:text-white font-semibold">{{ page.count }}</span>
            </div>
            <div *ngIf="!topPages.length" class="text-gray-500 dark:text-gray-400">No data yet</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Daily Traffic (Last 30 Days)</h2>
          <div class="h-48 flex items-end gap-1">
            <div *ngFor="let day of daily" class="flex-1 flex flex-col items-center">
              <div class="w-full bg-blue-500 dark:bg-blue-400 rounded-t" [style.height.%]="getBarHeight(day.count)"></div>
              <span class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate w-full text-center">{{ day.date | date:'MM/dd' }}</span>
            </div>
            <div *ngIf="!daily.length" class="w-full text-center text-gray-500 dark:text-gray-400">No data yet</div>
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

  constructor(private http: HttpClient) {}

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
    this.http.get<any>('/api/admin-analytics/stats').subscribe({
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
