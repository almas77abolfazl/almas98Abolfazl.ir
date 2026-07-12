import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

interface Experience {
  id?: string;
  role: string; roleFa?: string;
  company: string; companyFa?: string;
  startDate: string; endDate?: string;
  description?: string; descriptionFa?: string;
  technologies?: string[];
}

type SortCol = 'role' | 'company' | 'startDate' | null;

@Component({
  selector: 'app-experiences',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="admin-title mb-6">{{ i18n.t('nav_experiences') }}</h1>

      <form (ngSubmit)="onSubmit()" (input)="markDirty()" (change)="markDirty()" class="admin-card space-y-5 mb-6">
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
            <label class="admin-field-label">{{ i18n.t('edu_startDate') }}</label>
            <input type="date" [(ngModel)]="model.startDate" name="startDate" required class="admin-input" />
          </div>
          <div>
            <label class="admin-field-label">{{ i18n.t('edu_endDate') }}</label>
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
          <label class="admin-field-label">{{ i18n.t('exp_technologies') }}</label>
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
              <th class="admin-th cursor-pointer select-none" (click)="toggleSort('role')">
                {{ i18n.t('exp_role') }} <span class="text-[10px]">{{ sortArrow('role') }}</span>
              </th>
              <th class="admin-th cursor-pointer select-none" (click)="toggleSort('company')">
                {{ i18n.t('exp_company') }} <span class="text-[10px]">{{ sortArrow('company') }}</span>
              </th>
              <th class="admin-th cursor-pointer select-none" (click)="toggleSort('startDate')">
                {{ i18n.t('exp_start') }} <span class="text-[10px]">{{ sortArrow('startDate') }}</span>
              </th>
              <th class="admin-th text-end">{{ i18n.t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/70">
            @for (item of view(); track item.id) {
              <tr class="admin-row">
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
export class ExperiencesComponent implements OnInit {
  model: Experience = { role: '', company: '', startDate: '' };
  techInput = '';
  items = signal<Experience[]>([]);
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
    if (!col) return this.items();
    const dir = this.sortDir();
    return [...this.items()].sort((a, b) => {
      const av = (a[col] ?? '').toString().toLowerCase();
      const bv = (b[col] ?? '').toString().toLowerCase();
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
    this.http.get<Experience[]>('/api/admin/experiences').subscribe((data) => this.items.set(data));
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
    const body = { ...this.model, technologies: this.techInput.split(',').map((t) => t.trim()).filter(Boolean) };
    const req = this.editId
      ? this.http.put(`/api/admin/experiences/${this.editId}`, body)
      : this.http.post('/api/admin/experiences', body);
    req.subscribe(() => {
      this.reset();
      this.load();
      this.dirty.set(false);
      this.toast.success(this.editId ? this.i18n.t('toast_updated') : this.i18n.t('toast_added'));
    });
  }

  edit(item: Experience): void {
    this.model = { ...item };
    this.techInput = item.technologies?.join(', ') || '';
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
    this.http.delete(`/api/admin/experiences/${id}`).subscribe(() => {
      this.load();
      this.toast.success(this.i18n.t('toast_deleted'));
    });
  }

  reset(): void {
    this.model = { role: '', company: '', startDate: '' };
    this.techInput = '';
    this.editId = undefined;
    this.dirty.set(false);
  }
}
