import { Component, OnInit, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastService } from '../../core/services/toast.service';

interface Testimonial {
  id: string;
  authorName: string;
  authorNameFa?: string;
  companyRole?: string;
  companyRoleFa?: string;
  email?: string;
  content: string;
  contentFa?: string;
  authorImageUrl?: string;
  status: string;
  createdAt: string;
}

type Filter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

@Component({
  selector: 'app-testimonials',
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [],
})
export class TestimonialsComponent implements OnInit {
  items = signal<Testimonial[]>([]);
  filters: Filter[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
  filter = signal<Filter>('ALL');

  constructor(private http: HttpClient, public i18n: AdminI18nService, private toast: ToastService) {}

  ngOnInit(): void {
    this.load();
  }

  view = computed<Testimonial[]>(() => {
    const f = this.filter();
    if (f === 'ALL') return this.items();
    return this.items().filter((t) => t.status === f);
  });

  load(): void {
    this.http.get<Testimonial[]>('/api/admin/testimonials').subscribe((data) => this.items.set(data));
  }

  setFilter(f: Filter): void {
    this.filter.set(f);
  }

  count(f: Filter): number {
    return this.items().filter((t) => t.status === f).length;
  }

  setStatus(id: string, status: string): void {
    this.http.patch(`/api/admin/testimonials/${id}/status`, { status }).subscribe(() => {
      this.load();
      this.toast.success(status === 'APPROVED' ? this.i18n.t('test_approve') : this.i18n.t('test_reject'));
    });
  }

  initial(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase();
  }
}
