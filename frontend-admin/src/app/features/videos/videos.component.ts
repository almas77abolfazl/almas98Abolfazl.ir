import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

interface Video {
  id?: string;
  title: string; titleFa?: string;
  description?: string; descriptionFa?: string;
  platform: string;
  videoId: string;
  thumbnailUrl?: string;
  order?: number;
}

type SortCol = 'title' | 'platform' | 'order' | null;

@Component({
  selector: 'app-videos',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="admin-title mb-6">{{ i18n.t('nav_videos') }}</h1>

      <form (ngSubmit)="onSubmit()" (input)="markDirty()" (change)="markDirty()" class="admin-card space-y-5 mb-6">
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
              <th class="admin-th cursor-pointer select-none" (click)="toggleSort('title')">
                {{ i18n.t('vid_title') }} <span class="text-[10px]">{{ sortArrow('title') }}</span>
              </th>
              <th class="admin-th cursor-pointer select-none" (click)="toggleSort('platform')">
                {{ i18n.t('vid_platform') }} <span class="text-[10px]">{{ sortArrow('platform') }}</span>
              </th>
              <th class="admin-th cursor-pointer select-none" (click)="toggleSort('order')">
                {{ i18n.t('vid_order') }} <span class="text-[10px]">{{ sortArrow('order') }}</span>
              </th>
              <th class="admin-th text-end">{{ i18n.t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/70">
            @for (item of view(); track item.id) {
              <tr class="admin-row">
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
            } @empty {
              <tr><td colspan="4" class="admin-td text-center text-slate-400">{{ i18n.t('noItems') }}</td></tr>
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
  items = signal<Video[]>([]);
  editId?: string;
  dirty = signal(false);

  markDirty(): void {
    this.dirty.set(true);
  }

  canDeactivate(): boolean {
    return !this.dirty();
  }

  sortCol = signal<SortCol>(null);
  sortDir = signal<'asc' | 'desc'>('asc');

  view = computed(() => {
    const col = this.sortCol();
    if (!col) return this.items();
    const dir = this.sortDir();
    return [...this.items()].sort((a, b) => {
      let av: string | number = a[col] ?? (col === 'order' ? 0 : '');
      let bv: string | number = b[col] ?? (col === 'order' ? 0 : '');
      if (typeof av === 'number' && typeof bv === 'number') {
        return dir === 'asc' ? av - bv : bv - av;
      }
      av = av.toString().toLowerCase();
      bv = bv.toString().toLowerCase();
      return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  });

  constructor(
    private http: HttpClient,
    public i18n: AdminI18nService,
    private toast: ToastService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.http.get<Video[]>('/api/admin/videos').subscribe((data) => this.items.set(data));
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

  toggleSort(col: SortCol): void {
    if (this.sortCol() === col) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortCol.set(col);
      this.sortDir.set('asc');
    }
  }

  sortArrow(col: SortCol): string {
    if (this.sortCol() !== col) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  onSubmit(): void {
    const req = this.editId
      ? this.http.put(`/api/admin/videos/${this.editId}`, this.model)
      : this.http.post(`/api/admin/videos`, this.model);
    req.subscribe(() => {
      this.reset();
      this.load();
      this.dirty.set(false);
      this.toast.success(this.editId ? this.i18n.t('toast_updated') : this.i18n.t('toast_added'));
    });
  }

  edit(item: Video): void {
    this.model = { ...item };
    this.editId = item.id;
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
    this.http.delete(`/api/admin/videos/${id}`).subscribe(() => {
      this.load();
      this.toast.success(this.i18n.t('toast_deleted'));
    });
  }

  reset(): void {
    this.model = this.emptyModel();
    this.editId = undefined;
    this.dirty.set(false);
  }

  private emptyModel(): Video {
    return { title: '', platform: 'youtube', videoId: '', order: 0 };
  }
}
