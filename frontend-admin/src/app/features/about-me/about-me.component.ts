import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface AboutMe {
  id?: string;
  fullName: string;
  title: string;
  bio?: string;
  avatarUrl?: string;
  resumeUrl?: string;
}

@Component({
  selector: 'app-about-me',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">About Me</h1>
      <form (ngSubmit)="onSubmit()" #f="ngForm" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
          <input [(ngModel)]="model.fullName" name="fullName" required class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input [(ngModel)]="model.title" name="title" required class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
          <textarea [(ngModel)]="model.bio" name="bio" rows="4" class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
          <input [(ngModel)]="model.avatarUrl" name="avatarUrl" class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resume URL</label>
          <input [(ngModel)]="model.resumeUrl" name="resumeUrl" class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
      </form>
    </div>
  `,
  styles: [],
})
export class AboutMeComponent implements OnInit {
  model: AboutMe = { fullName: '', title: '' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<AboutMe>('/api/admin/about-me').subscribe({
      next: (data) => {
        if (data) {
          this.model = data;
        }
      },
    });
  }

  onSubmit(): void {
    this.http.post('/api/admin/about-me', this.model).subscribe({
      next: () => alert('Saved successfully'),
    });
  }
}
