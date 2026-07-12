import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';

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
      <h1 class="admin-title mb-6">{{ i18n.t('nav_articles') }}</h1>

      <form (ngSubmit)="onSubmit()" class="admin-card space-y-5 mb-6">
        <!-- Title + Language -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label">
              <span class="admin-lang" [class.admin-lang-en]="model.language === 'en'" [class.admin-lang-fa]="model.language === 'fa'">{{ model.language === 'fa' ? 'FA' : 'EN' }}</span>
              {{ model.language === 'fa' ? 'عنوان' : 'Title' }}
            </label>
            <input [(ngModel)]="model.title" name="title" required
              [dir]="model.language === 'fa' ? 'rtl' : 'ltr'"
              class="admin-input" [class.font-fa]="model.language === 'fa'" />
          </div>
          <div>
            <label class="admin-field-label">{{ i18n.t('art_language') }}</label>
            <select [(ngModel)]="model.language" name="language" class="admin-input">
              <option value="en">{{ i18n.t('art_langEn') }}</option>
              <option value="fa">{{ i18n.t('art_langFa') }}</option>
            </select>
          </div>
        </div>

        <!-- Slug -->
        <div>
          <label class="admin-field-label">{{ i18n.t('art_slug') }}</label>
          <input [(ngModel)]="model.slug" name="slug" required class="admin-input" />
        </div>

        <!-- Tags -->
        <div>
          <label class="admin-field-label">{{ i18n.t('art_tags') }}</label>
          <input [(ngModel)]="tagsInput" name="tags"
            [dir]="model.language === 'fa' ? 'rtl' : 'ltr'"
            class="admin-input" [class.font-fa]="model.language === 'fa'" />
          @if (parsedTags().length) {
            <div class="mt-2 flex flex-wrap gap-2">
              @for (tag of parsedTags(); track tag) {
                <span class="admin-badge admin-badge-info">{{ tag }}</span>
              }
            </div>
          }
        </div>

        <!-- Excerpt -->
        <div>
          <label class="admin-field-label">{{ i18n.t('art_excerpt') }}</label>
          <textarea [(ngModel)]="model.excerpt" name="excerpt" rows="2"
            [dir]="model.language === 'fa' ? 'rtl' : 'ltr'"
            class="admin-input" [class.font-fa]="model.language === 'fa'"></textarea>
        </div>

        <!-- Content -->
        <div>
          <label class="admin-field-label">{{ i18n.t('art_content') }}</label>
          <textarea [(ngModel)]="model.content" name="content" rows="12" required
            [dir]="model.language === 'fa' ? 'rtl' : 'ltr'"
            class="admin-input" [class.font-fa]="model.language === 'fa'"
            [class.font-mono]="model.language !== 'fa'"></textarea>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {{ i18n.t('art_readingTime', { n: estimatedReadingTime() }) }}
          </p>
        </div>

        <!-- Cover URL + Published -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label">{{ i18n.t('art_coverUrl') }}</label>
            <input [(ngModel)]="model.coverUrl" name="coverUrl" class="admin-input" />
          </div>
          <div class="flex items-center sm:mt-6">
            <input type="checkbox" [(ngModel)]="model.published" name="published" id="published" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900" />
            <label for="published" class="ms-2 text-sm font-medium text-slate-700 dark:text-slate-300">{{ i18n.t('art_published') }}</label>
          </div>
        </div>

        <div class="flex gap-3">
          <button type="submit" class="admin-btn admin-btn-primary">{{ editId ? i18n.t('update') : i18n.t('add') }}</button>
          @if (editId) {
            <button type="button" (click)="reset()" class="admin-btn admin-btn-ghost">{{ i18n.t('cancel') }}</button>
          }
        </div>
      </form>

      <div class="admin-card overflow-hidden">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700">
              <th class="admin-th">{{ i18n.t('art_content') }}</th>
              <th class="admin-th">{{ i18n.t('art_language') }}</th>
              <th class="admin-th">{{ i18n.t('art_read') }}</th>
              <th class="admin-th">{{ i18n.t('art_likes') }}</th>
              <th class="admin-th">{{ i18n.t('status') }}</th>
              <th class="admin-th text-end">{{ i18n.t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/70">
            @for (item of items; track item.id) {
              <tr>
                <td class="admin-td"
                  [dir]="item.language === 'fa' ? 'rtl' : 'ltr'"
                  [class.font-fa]="item.language === 'fa'">
                  {{ item.title }}
                  @if (item.tags?.length) {
                    <span class="mt-1 block text-xs text-slate-400">{{ item.tags?.join(', ') }}</span>
                  }
                </td>
                <td class="admin-td text-xs uppercase">{{ item.language }}</td>
                <td class="admin-td text-sm">{{ item.readingTime || 0 }}m</td>
                <td class="admin-td text-sm">{{ item.likeCount || 0 }}</td>
                <td class="admin-td">
                  <span class="admin-badge" [class.admin-badge-success]="item.published" [class.admin-badge-warning]="!item.published">
                    {{ item.published ? i18n.t('published') : i18n.t('draft') }}
                  </span>
                </td>
                <td class="admin-td text-end">
                  <button (click)="edit(item)" class="text-indigo-600 hover:underline dark:text-indigo-400">{{ i18n.t('edit') }}</button>
                  <button (click)="del(item.id!)" class="text-rose-600 hover:underline dark:text-rose-400 ms-3">{{ i18n.t('delete') }}</button>
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

  constructor(private http: HttpClient, public i18n: AdminI18nService) {}

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
