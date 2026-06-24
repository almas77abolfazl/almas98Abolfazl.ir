import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Testimonials</h1>
      <div class="space-y-4">
        <div *ngFor="let item of items" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.authorName }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.companyRole }}</p>
            </div>
            <span class="px-2 py-1 text-xs font-semibold rounded" [class]="getStatusClass(item.status)">{{ item.status }}</span>
          </div>
          <p class="text-gray-700 dark:text-gray-300 mb-4">{{ item.content }}</p>
          <div class="flex gap-2">
            <button *ngIf="item.status !== 'APPROVED'" (click)="setStatus(item.id, 'APPROVED')" class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Approve</button>
            <button *ngIf="item.status !== 'REJECTED'" (click)="setStatus(item.id, 'REJECTED')" class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Reject</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class TestimonialsComponent implements OnInit {
  items: Testimonial[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<Testimonial[]>('/api/admin/testimonials').subscribe((data) => (this.items = data));
  }

  setStatus(id: string, status: string): void {
    this.http.patch(`/api/admin/testimonials/${id}/status`, { status }).subscribe(() => this.load());
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }
}
