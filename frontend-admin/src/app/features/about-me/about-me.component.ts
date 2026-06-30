import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">About Me</h1>
      <form (ngSubmit)="onSubmit()" #f="ngForm" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">

        <!-- Full Name -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Full Name (EN)</label>
            <input [(ngModel)]="model.fullName" name="fullName" required
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">نام کامل (FA)</label>
            <input [(ngModel)]="model.fullNameFa" name="fullNameFa" dir="rtl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-fa" />
          </div>
        </div>

        <!-- Title -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Title (EN)</label>
            <input [(ngModel)]="model.title" name="title" required
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">عنوان (FA)</label>
            <input [(ngModel)]="model.titleFa" name="titleFa" dir="rtl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-fa" />
          </div>
        </div>

        <!-- Bio -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Bio (EN)</label>
            <textarea [(ngModel)]="model.bio" name="bio" rows="5"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">بیوگرافی (FA)</label>
            <textarea [(ngModel)]="model.bioFa" name="bioFa" rows="5" dir="rtl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-fa"></textarea>
          </div>
        </div>

        <!-- URLs -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
            <input [(ngModel)]="model.avatarUrl" name="avatarUrl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resume URL</label>
            <input [(ngModel)]="model.resumeUrl" name="resumeUrl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>

        <div class="flex gap-3 items-center">
          <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Save</button>
          @if (saved) { <span class="text-green-600 text-sm">Saved successfully!</span> }
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
  saved = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<AboutMe>('/api/admin/about-me').subscribe({
      next: (data) => { if (data) this.model = data; },
    });
  }

  onSubmit(): void {
    this.http.post('/api/admin/about-me', this.model).subscribe({
      next: () => {
        this.saved = true;
        setTimeout(() => this.saved = false, 3000);
      },
    });
  }
}
