import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Experience {
  id?: string;
  role: string;
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
  technologies?: string[];
}

@Component({
  selector: 'app-experiences',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Experiences</h1>

      <form (ngSubmit)="onSubmit()" #f="ngForm" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <input [(ngModel)]="model.role" name="role" required class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
            <input [(ngModel)]="model.company" name="company" required class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input type="date" [(ngModel)]="model.startDate" name="startDate" required class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input type="date" [(ngModel)]="model.endDate" name="endDate" class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technologies (comma separated)</label>
          <input [(ngModel)]="techInput" name="tech" class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
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
            <tr *ngFor="let item of items">
              <td class="px-6 py-4 text-gray-900 dark:text-white">{{ item.role }}</td>
              <td class="px-6 py-4 text-gray-900 dark:text-white">{{ item.company }}</td>
              <td class="px-6 py-4 text-gray-900 dark:text-white">{{ item.startDate }}</td>
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
export class ExperiencesComponent implements OnInit {
  model: Experience = { role: '', company: '', startDate: '' };
  techInput = '';
  items: Experience[] = [];
  editId?: string;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<Experience[]>('/api/admin/experiences').subscribe((data) => (this.items = data));
  }

  onSubmit(): void {
    const body = {
      ...this.model,
      technologies: this.techInput.split(',').map((t) => t.trim()),
    };
    if (this.editId) {
      this.http.put(`/api/admin/experiences/${this.editId}`, body).subscribe(() => this.reset());
    } else {
      this.http.post('/api/admin/experiences', body).subscribe(() => this.reset());
    }
    this.load();
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
