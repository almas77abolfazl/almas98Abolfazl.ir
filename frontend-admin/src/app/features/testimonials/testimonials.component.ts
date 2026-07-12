import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastService } from '../../core/services/toast.service';

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
  templateUrl: './testimonials.component.html',
  styles: [],
})
export class TestimonialsComponent implements OnInit {
  items: Testimonial[] = [];

  constructor(private http: HttpClient, public i18n: AdminI18nService, private toast: ToastService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<Testimonial[]>('/api/admin/testimonials').subscribe((data) => (this.items = data));
  }

  setStatus(id: string, status: string): void {
    this.http.patch(`/api/admin/testimonials/${id}/status`, { status }).subscribe(() => {
      this.load();
      this.toast.success(status === 'APPROVED' ? this.i18n.t('test_approve') : this.i18n.t('test_reject'));
    });
  }
}
