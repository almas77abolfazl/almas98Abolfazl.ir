import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

interface Skill {
  id?: string;
  name: string; nameFa?: string;
  category: string; categoryFa?: string;
  proficiency?: number;
}

type SortCol = 'name' | 'category' | 'proficiency' | null;

@Component({
  selector: 'app-skills',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="admin-title mb-6">{{ i18n.t('nav_skills') }}</h1>

      <form (ngSubmit)="onSubmit()" (input)="markDirty()" (change)="markDirty()" class="admin-card space-y-5 mb-6">
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
          <label class="admin-field-label">{{ i18n.t('skill_proficiency') }}</label>
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
              <th class="admin-th cursor-pointer select-none" (click)="toggleSort('name')">
                {{ i18n.t('skill_name') }} <span class="text-[10px]">{{ sortArrow('name') }}</span>
              </th>
              <th class="admin-th cursor-pointer select-none" (click)="toggleSort('category')">
                {{ i18n.t('skill_category') }} <span class="text-[10px]">{{ sortArrow('category') }}</span>
              </th>
              <th class="admin-th cursor-pointer select-none" (click)="toggleSort('proficiency')">
                {{ i18n.t('skill_proficiency') }} <span class="text-[10px]">{{ sortArrow('proficiency') }}</span>
              </th>
              <th class="admin-th text-end">{{ i18n.t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/70">
            @for (item of view(); track item.id) {
              <tr class="admin-row">
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
export class SkillsComponent implements OnInit {
  model: Skill = { name: '', category: '' };
  items: Skill[] = [];
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
    if (!col) return this.items;
    const dir = this.sortDir();
    return [...this.items].sort((a, b) => {
      let av: string | number = a[col] ?? (col === 'proficiency' ? 0 : '');
      let bv: string | number = b[col] ?? (col === 'proficiency' ? 0 : '');
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
    this.http.get<Skill[]>('/api/admin/skills').subscribe((data) => (this.items = data));
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
      ? this.http.put(`/api/admin/skills/${this.editId}`, this.model)
      : this.http.post('/api/admin/skills', this.model);
    req.subscribe(() => {
      this.reset();
      this.load();
      this.dirty.set(false);
      this.toast.success(this.editId ? this.i18n.t('toast_updated') : this.i18n.t('toast_added'));
    });
  }

  edit(item: Skill): void {
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
    this.http.delete(`/api/admin/skills/${id}`).subscribe(() => {
      this.load();
      this.toast.success(this.i18n.t('toast_deleted'));
    });
  }

  reset(): void {
    this.model = { name: '', category: '' };
    this.editId = undefined;
    this.dirty.set(false);
  }
}
