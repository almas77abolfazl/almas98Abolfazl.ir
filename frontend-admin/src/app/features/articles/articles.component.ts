import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Article {
  id?: string;
  title: string; titleFa?: string;
  slug: string;
  content: string; contentFa?: string;
  excerpt?: string; excerptFa?: string;
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

      <form (ngSubmit)="onSubmit()" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-5 mb-6">
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

        <!-- Slug -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
          <input [(ngModel)]="model.slug" name="slug" required
            class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>

        <!-- Excerpt -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Excerpt (EN)</label>
            <textarea [(ngModel)]="model.excerpt" name="excerpt" rows="2"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">خلاصه (FA)</label>
            <textarea [(ngModel)]="model.excerptFa" name="excerptFa" rows="2" dir="rtl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-fa"></textarea>
          </div>
        </div>

        <!-- Content -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Content (EN)</label>
            <textarea [(ngModel)]="model.content" name="content" rows="8" required
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"></textarea>
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">محتوا (FA)</label>
            <textarea [(ngModel)]="model.contentFa" name="contentFa" rows="8" dir="rtl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-fa text-sm"></textarea>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover URL</label>
            <input [(ngModel)]="model.coverUrl" name="coverUrl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div class="flex items-center mt-6">
            <input type="checkbox" [(ngModel)]="model.published" name="published" id="published" class="mr-2 h-4 w-4" />
            <label for="published" class="text-sm font-medium text-gray-700 dark:text-gray-300">Published</label>
          </div>
        </div>

        <div class="flex gap-3">
          <button type="submit" class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {{ editId ? 'Update' : 'Add' }}
          </button>
          @if (editId) {
            <button type="button" (click)="reset()" class="px-5 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300">Cancel</button>
          }
        </div>
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
            @for (item of items; track item.id) {
              <tr>
                <td class="px-6 py-4 text-gray-900 dark:text-white">
                  {{ item.title }}
                  @if (item.titleFa) { <span class="block text-xs text-green-600 font-fa" dir="rtl">{{ item.titleFa }}</span> }
                </td>
                <td class="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{{ item.slug }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs rounded font-medium"
                    [class]="item.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                    {{ item.published ? 'Published' : 'Draft' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button (click)="edit(item)" class="text-blue-600 mr-3 hover:underline">Edit</button>
                  <button (click)="del(item.id!)" class="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`.font-fa { font-family: 'Vazirmatn', system-ui, sans-serif; }`],
})
export class ArticlesComponent implements OnInit {
  model: Article = { title: '', slug: '', content: '', published: false };
  items: Article[] = [];
  editId?: string;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.http.get<Article[]>('/api/admin/articles').subscribe((data) => (this.items = data));
  }

  onSubmit(): void {
    const req = this.editId
      ? this.http.put(`/api/admin/articles/${this.editId}`, this.model)
      : this.http.post('/api/admin/articles', this.model);
    req.subscribe(() => { this.reset(); this.load(); });
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
