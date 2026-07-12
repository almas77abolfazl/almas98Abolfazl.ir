import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

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
  templateUrl: './contact-messages.component.html',
  styles: [],
})
export class ContactMessagesComponent implements OnInit {
  items: ContactMessage[] = [];

  constructor(private http: HttpClient, public i18n: AdminI18nService, private toast: ToastService, private confirm: ConfirmService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<ContactMessage[]>('/api/admin/contact-messages').subscribe((data) => (this.items = data));
  }

  markRead(id: string): void {
    this.http.put(`/api/admin/contact-messages/${id}`, { isRead: true }).subscribe(() => {
      this.load();
      this.toast.success(this.i18n.t('msg_read'));
    });
  }

  async del(id: string): Promise<void> {
    const ok = await this.confirm.confirm({
      title: this.i18n.t('confirm_title'),
      message: this.i18n.t('confirm_delete'),
      confirmText: this.i18n.t('confirm_yes'),
      cancelText: this.i18n.t('confirm_no'),
      danger: true,
    });
    if (!ok) return;
    this.http.delete(`/api/admin/contact-messages/${id}`).subscribe(() => {
      this.load();
      this.toast.success(this.i18n.t('toast_deleted'));
    });
  }
}
