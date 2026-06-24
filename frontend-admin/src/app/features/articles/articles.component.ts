import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Article {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverUrl?: string;
  published: boolean;
  publishedAt?: string;
}

@Component({
  selector: 'app-articles',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Articles</h1>
      <form (ngSubmit)="onSubmit()" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input [(ngModel)]="model.title" name="title" required class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
            <input [(ngModel)]="model.slug" name="slug" required class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt</label>
          <textarea [(ngModel)]="model.excerpt" name="excerpt" rows="2" class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
          <textarea [(ngModel)]="model.content" name="content" rows="6" required class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover URL</label>
            <input [(ngModel)]="model.coverUrl" name="coverUrl" class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div class="flex items-center">
            <input type="checkbox" [(ngModel)]="model.published" name="published" class="mr-2" />
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Published</label>
          </div>
        </div>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
      </form>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table class="min-w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Title</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Slug</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
            <tr *ngFor="let item of items">
              <td class="px-6 py-4 text-gray-900 dark:text-white">{{ item.title }}</td>
              <td class="px-6 py-4 text-gray-900 dark:text-white">{{ item.slug }}</td>
              <td class="px-6 py-4 text-gray-900 dark:text-white">{{ item.published ? 'Published' : 'Draft' }}</td>
              <td class="px-6 py-4 text-right">
                <button (click)="edit(item)" class="text-blue-600 mr-2">Edit</button>
                <button (click)="del(item.id!)" class="text-red-600">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [],
})
export class ArticlesComponent implements OnInit {
  model: Article = { title: '', slug: '', content: '', published: false };
  items: Article[] = [];
  editId?: string;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<Article[]>('/api/admin/articles').subscribe((data) => (this.items = data));
  }

  onSubmit(): void {
    if (this.editId) {
      this.http.put(`/api/admin/articles/${this.editId}`, this.model).subscribe(() => this.reset());
    } else {
      this.http.post('/api/admin/articles', this.model).subscribe(() => this.reset());
    }
    this.load();
  }

  edit(item: Article): void {
    this.model = { ...item };
    this.editId = item.id;
  }

  del(id: string): void {
    this.http.delete(`/api/admin/articles/${id}`).subscribe(() => this.load());
  }

  reset(): void {
    this.model = { title: '', slug: '', content: '', published: false };
    this.editId = undefined;
  }
}
