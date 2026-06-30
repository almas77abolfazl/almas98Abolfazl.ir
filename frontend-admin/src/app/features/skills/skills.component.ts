import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Skill {
  id?: string;
  name: string; nameFa?: string;
  category: string; categoryFa?: string;
  proficiency?: number;
}

@Component({
  selector: 'app-skills',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Skills</h1>

      <form (ngSubmit)="onSubmit()" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-5 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Name (EN)</label>
            <input [(ngModel)]="model.name" name="name" required
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">نام (FA)</label>
            <input [(ngModel)]="model.nameFa" name="nameFa" dir="rtl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-fa" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Category (EN)</label>
            <input [(ngModel)]="model.category" name="category" required
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">دسته‌بندی (FA)</label>
            <input [(ngModel)]="model.categoryFa" name="categoryFa" dir="rtl"
              class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-fa" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proficiency (0-100)</label>
          <input type="number" min="0" max="100" [(ngModel)]="model.proficiency" name="proficiency"
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Proficiency</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
            @for (item of items; track item.id) {
              <tr>
                <td class="px-6 py-4 text-gray-900 dark:text-white">
                  {{ item.name }}
                  @if (item.nameFa) { <span class="block text-xs text-green-600 font-fa" dir="rtl">{{ item.nameFa }}</span> }
                </td>
                <td class="px-6 py-4 text-gray-900 dark:text-white">
                  {{ item.category }}
                  @if (item.categoryFa) { <span class="block text-xs text-green-600 font-fa" dir="rtl">{{ item.categoryFa }}</span> }
                </td>
                <td class="px-6 py-4 text-gray-900 dark:text-white">{{ item.proficiency ?? 0 }}%</td>
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
export class SkillsComponent implements OnInit {
  model: Skill = { name: '', category: '' };
  items: Skill[] = [];
  editId?: string;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.http.get<Skill[]>('/api/admin/skills').subscribe((data) => (this.items = data));
  }

  onSubmit(): void {
    const req = this.editId
      ? this.http.put(`/api/admin/skills/${this.editId}`, this.model)
      : this.http.post('/api/admin/skills', this.model);
    req.subscribe(() => { this.reset(); this.load(); });
  }

  edit(item: Skill): void {
    this.model = { ...item };
    this.editId = item.id;
  }

  del(id: string): void {
    this.http.delete(`/api/admin/skills/${id}`).subscribe(() => this.load());
  }

  reset(): void {
    this.model = { name: '', category: '' };
    this.editId = undefined;
  }
}
