import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';

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
      <h1 class="admin-title mb-6">{{ i18n.t('nav_educations') }}</h1>

      <form (ngSubmit)="onSubmit()" class="admin-card space-y-5 mb-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-en">EN</span> Degree</label>
            <input [(ngModel)]="model.degree" name="degree" required class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-fa">FA</span> مدرک</label>
            <input [(ngModel)]="model.degreeFa" name="degreeFa" dir="rtl" class="admin-input font-fa" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-en">EN</span> Institution</label>
            <input [(ngModel)]="model.institution" name="institution" required class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-fa">FA</span> دانشگاه / موسسه</label>
            <input [(ngModel)]="model.institutionFa" name="institutionFa" dir="rtl" class="admin-input font-fa" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-en">EN</span> Field</label>
            <input [(ngModel)]="model.field" name="field" class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-fa">FA</span> رشته تحصیلی</label>
            <input [(ngModel)]="model.fieldFa" name="fieldFa" dir="rtl" class="admin-input font-fa" />
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
              <th class="admin-th">{{ i18n.t('edu_degree') }}</th>
              <th class="admin-th">{{ i18n.t('edu_institution') }}</th>
              <th class="admin-th text-end">{{ i18n.t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/70">
            @for (item of items; track item.id) {
              <tr>
                <td class="admin-td">
                  {{ item.degree }}
                  @if (item.degreeFa) { <span class="block text-xs font-fa text-emerald-600" dir="rtl">{{ item.degreeFa }}</span> }
                </td>
                <td class="admin-td">
                  {{ item.institution }}
                  @if (item.institutionFa) { <span class="block text-xs font-fa text-emerald-600" dir="rtl">{{ item.institutionFa }}</span> }
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
export class EducationsComponent implements OnInit {
  model: Education = { degree: '', institution: '', startDate: '' };
  items: Education[] = [];
  editId?: string;

  constructor(private http: HttpClient, public i18n: AdminI18nService) {}

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
