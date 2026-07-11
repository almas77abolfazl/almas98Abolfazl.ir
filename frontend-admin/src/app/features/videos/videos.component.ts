import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Videos</h1>

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

        <!-- Platform + Video ID -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
            <select [(ngModel)]="model.platform" name="platform"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="youtube">YouTube</option>
              <option value="aparat">Aparat</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Video ID / Hash
            </label>
            <input [(ngModel)]="model.videoId" name="videoId" required
              [placeholder]="model.platform === 'aparat' ? 'e.g. aBcD1' : 'e.g. dQw4w9WgXcQ'"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ model.platform === 'aparat'
                ? 'Aparat video hash (from the share/embed URL).'
                : 'YouTube video ID (the v= part of the URL).' }}
            </p>
          </div>
        </div>

        <!-- Description -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Description (EN)</label>
            <textarea [(ngModel)]="model.description" name="description" rows="2"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">توضیحات (FA)</label>
            <textarea [(ngModel)]="model.descriptionFa" name="descriptionFa" rows="2" dir="rtl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-fa"></textarea>
          </div>
        </div>

        <!-- Thumbnail + Order -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL (optional)</label>
            <input [(ngModel)]="model.thumbnailUrl" name="thumbnailUrl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
            <input type="number" [(ngModel)]="model.order" name="order"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Preview</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Title</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Platform</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Order</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
            @for (item of items; track item.id) {
              <tr>
                <td class="px-6 py-4">
                  <img [src]="thumb(item)" [alt]="item.title"
                    class="w-24 h-14 object-cover rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td class="px-6 py-4 text-gray-900 dark:text-white">
                  {{ item.title }}
                  @if (item.titleFa) { <span class="block text-xs text-green-600 font-fa" dir="rtl">{{ item.titleFa }}</span> }
                </td>
                <td class="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm capitalize">{{ item.platform }}</td>
                <td class="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{{ item.order ?? 0 }}</td>
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
export class VideosComponent implements OnInit {
  model: Video = this.emptyModel();
  items: Video[] = [];
  editId?: string;

  constructor(private http: HttpClient) {}

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
      : this.http.post('/api/admin/videos', this.model);
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
