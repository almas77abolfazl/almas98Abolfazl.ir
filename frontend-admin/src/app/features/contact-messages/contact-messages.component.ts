import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Messages</h1>
      <div class="space-y-4">
        <div *ngFor="let item of items" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.name }} &lt;{{ item.email }}&gt;</h3>
              <p *ngIf="item.subject" class="text-sm text-gray-500 dark:text-gray-400">{{ item.subject }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ item.createdAt }}</p>
            </div>
            <span class="px-2 py-1 text-xs font-semibold rounded" [class]="item.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-800'">{{ item.isRead ? 'Read' : 'Unread' }}</span>
          </div>
          <p class="text-gray-700 dark:text-gray-300 mb-4">{{ item.message }}</p>
          <div class="flex gap-2">
            <button *ngIf="!item.isRead" (click)="markRead(item.id)" class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Mark as Read</button>
            <button (click)="del(item.id)" class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ContactMessagesComponent implements OnInit {
  items: ContactMessage[] = [];

  constructor(private http: HttpClient) {}

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
