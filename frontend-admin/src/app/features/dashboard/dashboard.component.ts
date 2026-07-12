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

  getBarHeight(count: number): number {
    if (!this.daily.length) return 0;
    const max = Math.max(...this.daily.map(d => d.count), 1);
    return (count / max) * 100;
  }
}
