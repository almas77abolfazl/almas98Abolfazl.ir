import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';

interface Testimonial {
  id: string;
  authorName: string;
  companyRole?: string;
  content: string;
  rating?: number;
  status: string;
}

@Component({
  selector: 'app-testimonials',
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="admin-title mb-6">{{ i18n.t('nav_testimonials') }}</h1>
      <div class="space-y-4">
        @for (item of items; track item.id) {
          <div class="admin-card">
            <div class="mb-2 flex items-start justify-between gap-4">
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ item.authorName }}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.companyRole }}</p>
              </div>
              <span class="admin-badge"
                [class.admin-badge-success]="item.status === 'APPROVED'"
                [class.admin-badge-danger]="item.status === 'REJECTED'"
                [class.admin-badge-warning]="item.status === 'PENDING'">
                {{ item.status === 'APPROVED' ? i18n.t('test_approved') : item.status === 'REJECTED' ? i18n.t('test_rejected') : i18n.t('test_pending') }}
              </span>
            </div>
            <p class="mb-4 text-slate-700 dark:text-slate-300">{{ item.content }}</p>
            <div class="flex gap-2">
              @if (item.status !== 'APPROVED') {
                <button (click)="setStatus(item.id, 'APPROVED')" class="admin-btn admin-btn-primary">{{ i18n.t('test_approve') }}</button>
              }
              @if (item.status !== 'REJECTED') {
                <button (click)="setStatus(item.id, 'REJECTED')" class="admin-btn admin-btn-danger">{{ i18n.t('test_reject') }}</button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class TestimonialsComponent implements OnInit {
  items: Testimonial[] = [];

  constructor(private http: HttpClient, public i18n: AdminI18nService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<Testimonial[]>('/api/admin/testimonials').subscribe((data) => (this.items = data));
  }

  setStatus(id: string, status: string): void {
    this.http.patch(`/api/admin/testimonials/${id}/status`, { status }).subscribe(() => this.load());
  }
}
