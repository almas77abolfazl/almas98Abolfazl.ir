import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Experience {
  id?: string;
  role: string; roleFa?: string;
  company: string; companyFa?: string;
  startDate: string; endDate?: string;
  description?: string; descriptionFa?: string;
  technologies?: string[];
}

@Component({
  selector: 'app-experiences',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Experiences</h1>

      <form (ngSubmit)="onSubmit()" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-5 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Role (EN)</label>
            <input [(ngModel)]="model.role" name="role" required
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">سمت شغلی (FA)</label>
            <input [(ngModel)]="model.roleFa" name="roleFa" dir="rtl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-fa" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Company (EN)</label>
            <input [(ngModel)]="model.company" name="company" required
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">شرکت (FA)</label>
            <input [(ngModel)]="model.companyFa" name="companyFa" dir="rtl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-fa" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input type="date" [(ngModel)]="model.startDate" name="startDate" required
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input type="date" [(ngModel)]="model.endDate" name="endDate"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Description (EN)</label>
            <textarea [(ngModel)]="model.description" name="description" rows="3"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">توضیحات (FA)</label>
            <textarea [(ngModel)]="model.descriptionFa" name="descriptionFa" rows="3" dir="rtl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-fa"></textarea>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technologies (comma separated)</label>
          <input [(ngModel)]="techInput" name="tech"
            class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Company</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Start</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
            @for (item of items; track item.id) {
              <tr>
                <td class="px-6 py-4 text-gray-900 dark:text-white">
                  {{ item.role }}
                  @if (item.roleFa) { <span class="block text-xs text-green-600 font-fa" dir="rtl">{{ item.roleFa }}</span> }
                </td>
                <td class="px-6 py-4 text-gray-900 dark:text-white">
                  {{ item.company }}
                  @if (item.companyFa) { <span class="block text-xs text-green-600 font-fa" dir="rtl">{{ item.companyFa }}</span> }
                </td>
                <td class="px-6 py-4 text-gray-900 dark:text-white">{{ item.startDate | date:'yyyy-MM' }}</td>
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
export class ExperiencesComponent implements OnInit {
  model: Experience = { role: '', company: '', startDate: '' };
  techInput = '';
  items: Experience[] = [];
  editId?: string;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.http.get<Experience[]>('/api/admin/experiences').subscribe((data) => (this.items = data));
  }

  onSubmit(): void {
    const body = { ...this.model, technologies: this.techInput.split(',').map((t) => t.trim()).filter(Boolean) };
    const req = this.editId
      ? this.http.put(`/api/admin/experiences/${this.editId}`, body)
      : this.http.post('/api/admin/experiences', body);
    req.subscribe(() => { this.reset(); this.load(); });
  }

  edit(item: Experience): void {
    this.model = { ...item };
    this.techInput = item.technologies?.join(', ') || '';
    this.editId = item.id;
  }

  del(id: string): void {
    this.http.delete(`/api/admin/experiences/${id}`).subscribe(() => this.load());
  }

  reset(): void {
    this.model = { role: '', company: '', startDate: '' };
    this.techInput = '';
    this.editId = undefined;
  }
}
