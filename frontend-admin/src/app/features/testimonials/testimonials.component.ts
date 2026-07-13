import { Component, OnInit } from '@angular/core';
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
  styles: [],
})
export class TestimonialsComponent implements OnInit {
  items: Testimonial[] = [];
  filters: Filter[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
  filter: Filter = 'ALL';

  constructor(private http: HttpClient, public i18n: AdminI18nService, private toast: ToastService) {}

  ngOnInit(): void {
    this.load();
  }

  get view(): Testimonial[] {
    if (this.filter === 'ALL') return this.items;
    return this.items.filter((t) => t.status === this.filter);
  }

  load(): void {
    this.http.get<Testimonial[]>('/api/admin/testimonials').subscribe((data) => (this.items = data));
  }

  setFilter(f: Filter): void {
    this.filter = f;
  }

  count(f: Filter): number {
    return this.items.filter((t) => t.status === f).length;
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
