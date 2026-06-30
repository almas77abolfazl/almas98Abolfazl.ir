import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Education {
  id?: string;
  degree: string; degreeFa?: string;
  institution: string; institutionFa?: string;
  field?: string; fieldFa?: string;
  startDate: string; endDate?: string;
  description?: string; descriptionFa?: string;
}

@Component({
  selector: 'app-educations',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Educations</h1>

      <form (ngSubmit)="onSubmit()" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-5 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Degree (EN)</label>
            <input [(ngModel)]="model.degree" name="degree" required
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">مدرک (FA)</label>
            <input [(ngModel)]="model.degreeFa" name="degreeFa" dir="rtl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-fa" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Institution (EN)</label>
            <input [(ngModel)]="model.institution" name="institution" required
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">دانشگاه / موسسه (FA)</label>
            <input [(ngModel)]="model.institutionFa" name="institutionFa" dir="rtl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-fa" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Field (EN)</label>
            <input [(ngModel)]="model.field" name="field"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">رشته تحصیلی (FA)</label>
            <input [(ngModel)]="model.fieldFa" name="fieldFa" dir="rtl"
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Degree</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Institution</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
            @for (item of items; track item.id) {
              <tr>
                <td class="px-6 py-4 text-gray-900 dark:text-white">
                  {{ item.degree }}
                  @if (item.degreeFa) { <span class="block text-xs text-green-600 font-fa" dir="rtl">{{ item.degreeFa }}</span> }
                </td>
                <td class="px-6 py-4 text-gray-900 dark:text-white">
                  {{ item.institution }}
                  @if (item.institutionFa) { <span class="block text-xs text-green-600 font-fa" dir="rtl">{{ item.institutionFa }}</span> }
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
export class EducationsComponent implements OnInit {
  model: Education = { degree: '', institution: '', startDate: '' };
  items: Education[] = [];
  editId?: string;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.http.get<Education[]>('/api/admin/educations').subscribe((data) => (this.items = data));
  }

  onSubmit(): void {
    const req = this.editId
      ? this.http.put(`/api/admin/educations/${this.editId}`, this.model)
      : this.http.post('/api/admin/educations', this.model);
    req.subscribe(() => { this.reset(); this.load(); });
  }

  edit(item: Education): void {
    this.model = { ...item };
    this.editId = item.id;
  }

  del(id: string): void {
    this.http.delete(`/api/admin/educations/${id}`).subscribe(() => this.load());
  }

  reset(): void {
    this.model = { degree: '', institution: '', startDate: '' };
    this.editId = undefined;
  }
}
