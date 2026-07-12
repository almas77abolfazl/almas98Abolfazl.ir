import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';

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
      <h1 class="admin-title mb-6">{{ i18n.t('nav_skills') }}</h1>

      <form (ngSubmit)="onSubmit()" class="admin-card space-y-5 mb-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-en">EN</span> Name</label>
            <input [(ngModel)]="model.name" name="name" required class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-fa">FA</span> نام</label>
            <input [(ngModel)]="model.nameFa" name="nameFa" dir="rtl" class="admin-input font-fa" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-en">EN</span> Category</label>
            <input [(ngModel)]="model.category" name="category" required class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label"><span class="admin-lang admin-lang-fa">FA</span> دسته‌بندی</label>
            <input [(ngModel)]="model.categoryFa" name="categoryFa" dir="rtl" class="admin-input font-fa" />
          </div>
        </div>

        <div>
          <label class="admin-field-label">Proficiency (0-100)</label>
          <input type="number" min="0" max="100" [(ngModel)]="model.proficiency" name="proficiency" class="admin-input" />
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
              <th class="admin-th">{{ i18n.t('skill_name') }}</th>
              <th class="admin-th">{{ i18n.t('skill_category') }}</th>
              <th class="admin-th">{{ i18n.t('skill_proficiency') }}</th>
              <th class="admin-th text-end">{{ i18n.t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/70">
            @for (item of items; track item.id) {
              <tr>
                <td class="admin-td">
                  {{ item.name }}
                  @if (item.nameFa) { <span class="block text-xs font-fa text-emerald-600" dir="rtl">{{ item.nameFa }}</span> }
                </td>
                <td class="admin-td">
                  {{ item.category }}
                  @if (item.categoryFa) { <span class="block text-xs font-fa text-emerald-600" dir="rtl">{{ item.categoryFa }}</span> }
                </td>
                <td class="admin-td">{{ item.proficiency ?? 0 }}%</td>
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
export class SkillsComponent implements OnInit {
  model: Skill = { name: '', category: '' };
  items: Skill[] = [];
  editId?: string;

  constructor(private http: HttpClient, public i18n: AdminI18nService) {}

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
