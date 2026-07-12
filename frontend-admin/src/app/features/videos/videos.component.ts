import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';

interface Video {
  id?: string;
  title: string; titleFa?: string;
  description?: string; descriptionFa?: string;
  platform: string;
  videoId: string;
  thumbnailUrl?: string;
  order?: number;
}

@Component({
  selector: 'app-videos',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="admin-title mb-6">{{ i18n.t('nav_videos') }}</h1>

      <form (ngSubmit)="onSubmit()" class="admin-card space-y-5 mb-6">
        <!-- Title -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-en">EN</span> {{ i18n.t('vid_title') }}</label>
            <input [(ngModel)]="model.title" name="title" required class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-fa">FA</span> {{ i18n.t('vid_title') }}</label>
            <input [(ngModel)]="model.titleFa" name="titleFa" dir="rtl" class="admin-input font-fa" />
          </div>
        </div>

        <!-- Platform + Video ID -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label">{{ i18n.t('vid_platform') }}</label>
            <select [(ngModel)]="model.platform" name="platform" class="admin-input">
              <option value="youtube">{{ i18n.t('vid_youtube') }}</option>
              <option value="aparat">{{ i18n.t('vid_aparat') }}</option>
            </select>
          </div>
          <div>
            <label class="admin-field-label">{{ i18n.t('vid_videoId') }}</label>
            <input [(ngModel)]="model.videoId" name="videoId" required
              [placeholder]="model.platform === 'aparat' ? 'e.g. aBcD1' : 'e.g. dQw4w9WgXcQ'"
              class="admin-input" />
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {{ model.platform === 'aparat' ? i18n.t('vid_videoIdHelpAparat') : i18n.t('vid_videoIdHelpYoutube') }}
            </p>
          </div>
        </div>

        <!-- Description -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-en">EN</span> {{ i18n.t('vid_description') }}</label>
            <textarea [(ngModel)]="model.description" name="description" rows="2" class="admin-input"></textarea>
          </div>
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-fa">FA</span> {{ i18n.t('vid_description') }}</label>
            <textarea [(ngModel)]="model.descriptionFa" name="descriptionFa" rows="2" dir="rtl" class="admin-input font-fa"></textarea>
          </div>
        </div>

        <!-- Thumbnail + Order -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label">{{ i18n.t('vid_thumbnail') }}</label>
            <input [(ngModel)]="model.thumbnailUrl" name="thumbnailUrl" class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label">{{ i18n.t('vid_order') }}</label>
            <input type="number" [(ngModel)]="model.order" name="order" class="admin-input" />
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
              <th class="admin-th">{{ i18n.t('vid_preview') }}</th>
              <th class="admin-th">{{ i18n.t('vid_title') }}</th>
              <th class="admin-th">{{ i18n.t('vid_platform') }}</th>
              <th class="admin-th">{{ i18n.t('vid_order') }}</th>
              <th class="admin-th text-end">{{ i18n.t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/70">
            @for (item of items; track item.id) {
              <tr>
                <td class="admin-td">
                  <img [src]="thumb(item)" [alt]="item.title"
                    class="h-14 w-24 rounded bg-slate-200 object-cover dark:bg-slate-700" />
                </td>
                <td class="admin-td">
                  {{ item.title }}
                  @if (item.titleFa) { <span class="block text-xs font-fa text-emerald-600" dir="rtl">{{ item.titleFa }}</span> }
                </td>
                <td class="admin-td text-sm capitalize">{{ item.platform }}</td>
                <td class="admin-td text-sm">{{ item.order ?? 0 }}</td>
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
export class VideosComponent implements OnInit {
  model: Video = this.emptyModel();
  items: Video[] = [];
  editId?: string;

  constructor(private http: HttpClient, public i18n: AdminI18nService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.http.get<Video[]>('/api/admin/videos').subscribe((data) => (this.items = data));
  }

  thumb(item: Video): string {
    if (item.thumbnailUrl) {
      return item.thumbnailUrl;
    }
    if (item.platform === 'youtube' && item.videoId) {
      return `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`;
    }
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="56"><rect width="100%" height="100%" fill="#e5e7eb"/></svg>'
    );
  }

  onSubmit(): void {
    const req = this.editId
      ? this.http.put(`/api/admin/videos/${this.editId}`, this.model)
      : this.http.post(`/api/admin/videos`, this.model);
    req.subscribe(() => { this.reset(); this.load(); });
  }

  edit(item: Video): void {
    this.model = { ...item };
    this.editId = item.id;
  }

  del(id: string): void {
    this.http.delete(`/api/admin/videos/${id}`).subscribe(() => this.load());
  }

  reset(): void {
    this.model = this.emptyModel();
    this.editId = undefined;
  }

  private emptyModel(): Video {
    return { title: '', platform: 'youtube', videoId: '', order: 0 };
  }
}
