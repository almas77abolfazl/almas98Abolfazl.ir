import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-contact-messages',
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="admin-title mb-6">{{ i18n.t('nav_messages') }}</h1>
      <div class="space-y-4">
        @for (item of items; track item.id) {
          <div class="admin-card">
            <div class="mb-2 flex items-start justify-between gap-4">
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ item.name }} &lt;{{ item.email }}&gt;</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.subject || i18n.t('msg_noSubject') }}</p>
                <p class="mt-1 text-xs text-slate-400">{{ item.createdAt }}</p>
              </div>
              <span class="admin-badge"
                [class.admin-badge-info]="item.isRead"
                [class.admin-badge-warning]="!item.isRead">
                {{ item.isRead ? i18n.t('msg_read') : i18n.t('msg_unread') }}
              </span>
            </div>
            <p class="mb-4 text-slate-700 dark:text-slate-300">{{ item.message }}</p>
            <div class="flex gap-2">
              @if (!item.isRead) {
                <button (click)="markRead(item.id)" class="admin-btn admin-btn-primary">{{ i18n.t('msg_markRead') }}</button>
              }
              <button (click)="del(item.id)" class="admin-btn admin-btn-danger">{{ i18n.t('delete') }}</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class ContactMessagesComponent implements OnInit {
  items: ContactMessage[] = [];

  constructor(private http: HttpClient, public i18n: AdminI18nService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<ContactMessage[]>('/api/admin/contact-messages').subscribe((data) => (this.items = data));
  }

  markRead(id: string): void {
    this.http.put(`/api/admin/contact-messages/${id}`, { isRead: true }).subscribe(() => this.load());
  }

  del(id: string): void {
    this.http.delete(`/api/admin/contact-messages/${id}`).subscribe(() => this.load());
  }
}
