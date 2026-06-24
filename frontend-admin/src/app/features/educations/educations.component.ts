import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Education {
  id?: string;
  degree: string;
  institution: string;
  field?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

@Component({
  selector: 'app-educations',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Educations</h1>
      <form (ngSubmit)="onSubmit()" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Degree</label>
            <input [(ngModel)]="model.degree" name="degree" required class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution</label>
            <input [(ngModel)]="model.institution" name="institution" required class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field</label>
            <input [(ngModel)]="model.field" name="field" class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input type="date" [(ngModel)]="model.startDate" name="startDate" required class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
          <input type="date" [(ngModel)]="model.endDate" name="endDate" class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea [(ngModel)]="model.description" name="description" rows="3" class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
        </div>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
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
            <tr *ngFor="let item of items">
              <td class="px-6 py-4 text-gray-900 dark:text-white">{{ item.degree }}</td>
              <td class="px-6 py-4 text-gray-900 dark:text-white">{{ item.institution }}</td>
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
export class EducationsComponent implements OnInit {
  model: Education = { degree: '', institution: '', startDate: '' };
  items: Education[] = [];
  editId?: string;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<Education[]>('/api/admin/educations').subscribe((data) => (this.items = data));
  }

  onSubmit(): void {
    if (this.editId) {
      this.http.put(`/api/admin/educations/${this.editId}`, this.model).subscribe(() => this.reset());
    } else {
      this.http.post('/api/admin/educations', this.model).subscribe(() => this.reset());
    }
    this.load();
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
