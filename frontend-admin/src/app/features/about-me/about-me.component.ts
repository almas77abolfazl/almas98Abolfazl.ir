import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastService } from '../../core/services/toast.service';

interface AboutMe {
  id?: string;
  fullName: string; fullNameFa?: string;
  title: string; titleFa?: string;
  bio?: string; bioFa?: string;
  avatarUrl?: string;
  resumeUrl?: string;
}

@Component({
  selector: 'app-about-me',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="admin-title mb-6">{{ i18n.t('nav_about') }}</h1>
      <form (ngSubmit)="onSubmit()" #f="ngForm" (input)="markDirty()" (change)="markDirty()" class="admin-card space-y-6">

        <!-- Full Name -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-en">EN</span> Full Name</label>
            <input [(ngModel)]="model.fullName" name="fullName" required class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-fa">FA</span> نام کامل</label>
            <input [(ngModel)]="model.fullNameFa" name="fullNameFa" dir="rtl" class="admin-input font-fa" />
          </div>
        </div>

        <!-- Title -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-en">EN</span> Title</label>
            <input [(ngModel)]="model.title" name="title" required class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-fa">FA</span> عنوان</label>
            <input [(ngModel)]="model.titleFa" name="titleFa" dir="rtl" class="admin-input font-fa" />
          </div>
        </div>

        <!-- Bio -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-en">EN</span> Bio</label>
            <textarea [(ngModel)]="model.bio" name="bio" rows="5" class="admin-input"></textarea>
          </div>
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-fa">FA</span> بیوگرافی</label>
            <textarea [(ngModel)]="model.bioFa" name="bioFa" rows="5" dir="rtl" class="admin-input font-fa"></textarea>
          </div>
        </div>

        <!-- URLs -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label">{{ i18n.t('about_avatarUrl') }}</label>
            <input [(ngModel)]="model.avatarUrl" name="avatarUrl" class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label">{{ i18n.t('about_resumeUrl') }}</label>
            <input [(ngModel)]="model.resumeUrl" name="resumeUrl" class="admin-input" />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button type="submit" class="admin-btn admin-btn-primary">{{ i18n.t('save') }}</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .font-fa { font-family: 'Vazirmatn', system-ui, sans-serif; }
  `],
})
export class AboutMeComponent implements OnInit {
  model: AboutMe = { fullName: '', title: '' };

  dirty = signal(false);

  markDirty(): void {
    this.dirty.set(true);
  }

  canDeactivate(): boolean {
    return !this.dirty();
  }

  constructor(private http: HttpClient, public i18n: AdminI18nService, private toast: ToastService) {}

  ngOnInit(): void {
    this.http.get<AboutMe>('/api/admin/about-me').subscribe({
      next: (data) => { if (data) this.model = data; },
    });
  }

  onSubmit(): void {
    this.http.post('/api/admin/about-me', this.model).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('toast_saved'));
        this.dirty.set(false);
      },
    });
  }
}
