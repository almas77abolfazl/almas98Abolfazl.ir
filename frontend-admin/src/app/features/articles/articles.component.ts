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
  language: string;
  tags?: string[];
  readingTime?: number;
  likeCount?: number;
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
        <!-- Title + Language -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input [(ngModel)]="model.title" name="title" required
              [dir]="model.language === 'fa' ? 'rtl' : 'ltr'"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              [class.font-fa]="model.language === 'fa'" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
            <select [(ngModel)]="model.language" name="language"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="en">English</option>
              <option value="fa">فارسی</option>
            </select>
          </div>
        </div>

        <!-- Slug -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
          <input [(ngModel)]="model.slug" name="slug" required
            class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
          <input [(ngModel)]="tagsInput" name="tags"
            [dir]="model.language === 'fa' ? 'rtl' : 'ltr'"
            placeholder="angular, typescript, web"
            class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            [class.font-fa]="model.language === 'fa'" />
          @if (parsedTags().length) {
            <div class="flex flex-wrap gap-2 mt-2">
              @for (tag of parsedTags(); track tag) {
                <span class="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">{{ tag }}</span>
              }
            </div>
          }
        </div>

        <!-- Excerpt -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt</label>
          <textarea [(ngModel)]="model.excerpt" name="excerpt" rows="2"
            [dir]="model.language === 'fa' ? 'rtl' : 'ltr'"
            class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            [class.font-fa]="model.language === 'fa'"></textarea>
        </div>

        <!-- Content -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
          <textarea [(ngModel)]="model.content" name="content" rows="12" required
            [dir]="model.language === 'fa' ? 'rtl' : 'ltr'"
            class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            [class.font-fa]="model.language === 'fa'"
            [class.font-mono]="model.language !== 'fa'"></textarea>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Estimated reading time: {{ estimatedReadingTime() }} min (auto-calculated on save)
          </p>
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Lang</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Read</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Likes</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
            @for (item of items; track item.id) {
              <tr>
                <td class="px-6 py-4 text-gray-900 dark:text-white"
                  [dir]="item.language === 'fa' ? 'rtl' : 'ltr'"
                  [class.font-fa]="item.language === 'fa'">
                  {{ item.title }}
                  @if (item.tags?.length) {
                    <span class="block text-xs text-gray-400 mt-1">{{ item.tags?.join(', ') }}</span>
                  }
                </td>
                <td class="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs uppercase">{{ item.language }}</td>
                <td class="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{{ item.readingTime || 0 }}m</td>
                <td class="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{{ item.likeCount || 0 }}</td>
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
  model: Article = this.emptyModel();
  tagsInput = '';
  items: Article[] = [];
  editId?: string;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.http.get<Article[]>('/api/admin/articles').subscribe((data) => (this.items = data));
  }

  parsedTags(): string[] {
    return this.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  estimatedReadingTime(): number {
    const words = this.model.content?.trim() ? this.model.content.trim().split(/\s+/).length : 0;
    return words > 0 ? Math.ceil(words / 200) : 0;
  }

  onSubmit(): void {
    const payload: Article = { ...this.model, tags: this.parsedTags() };
    const req = this.editId
      ? this.http.put(`/api/admin/articles/${this.editId}`, payload)
      : this.http.post('/api/admin/articles', payload);
    req.subscribe(() => { this.reset(); this.load(); });
  }

  edit(item: Article): void {
    this.model = { ...item };
    this.tagsInput = (item.tags ?? []).join(', ');
    this.editId = item.id;
  }

  del(id: string): void {
    this.http.delete(`/api/admin/articles/${id}`).subscribe(() => this.load());
  }

  reset(): void {
    this.model = this.emptyModel();
    this.tagsInput = '';
    this.editId = undefined;
  }

  private emptyModel(): Article {
    return { title: '', slug: '', content: '', language: 'en', tags: [], published: false };
  }
}
