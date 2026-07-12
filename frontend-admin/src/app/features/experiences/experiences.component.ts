import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';

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
      <h1 class="admin-title mb-6">{{ i18n.t('nav_experiences') }}</h1>

      <form (ngSubmit)="onSubmit()" class="admin-card space-y-5 mb-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-en">EN</span> Role</label>
            <input [(ngModel)]="model.role" name="role" required class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-fa">FA</span> سمت شغلی</label>
            <input [(ngModel)]="model.roleFa" name="roleFa" dir="rtl" class="admin-input font-fa" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-en">EN</span> Company</label>
            <input [(ngModel)]="model.company" name="company" required class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-fa">FA</span> شرکت</label>
            <input [(ngModel)]="model.companyFa" name="companyFa" dir="rtl" class="admin-input font-fa" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label">Start Date</label>
            <input type="date" [(ngModel)]="model.startDate" name="startDate" required class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label">End Date</label>
            <input type="date" [(ngModel)]="model.endDate" name="endDate" class="admin-input" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-en">EN</span> Description</label>
            <textarea [(ngModel)]="model.description" name="description" rows="3" class="admin-input"></textarea>
          </div>
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-fa">FA</span> توضیحات</label>
            <textarea [(ngModel)]="model.descriptionFa" name="descriptionFa" rows="3" dir="rtl" class="admin-input font-fa"></textarea>
          </div>
        </div>

        <div>
          <label class="admin-field-label">Technologies (comma separated)</label>
          <input [(ngModel)]="techInput" name="tech" class="admin-input" />
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
              <th class="admin-th">{{ i18n.t('exp_role') }}</th>
              <th class="admin-th">{{ i18n.t('exp_company') }}</th>
              <th class="admin-th">{{ i18n.t('exp_start') }}</th>
              <th class="admin-th text-end">{{ i18n.t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/70">
            @for (item of items; track item.id) {
              <tr>
                <td class="admin-td">
                  {{ item.role }}
                  @if (item.roleFa) { <span class="block text-xs font-fa text-emerald-600" dir="rtl">{{ item.roleFa }}</span> }
                </td>
                <td class="admin-td">
                  {{ item.company }}
                  @if (item.companyFa) { <span class="block text-xs font-fa text-emerald-600" dir="rtl">{{ item.companyFa }}</span> }
                </td>
                <td class="admin-td">{{ item.startDate | date:'yyyy-MM' }}</td>
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
export class ExperiencesComponent implements OnInit {
  model: Experience = { role: '', company: '', startDate: '' };
  techInput = '';
  items: Experience[] = [];
  editId?: string;

  constructor(private http: HttpClient, public i18n: AdminI18nService) {}

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
