import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

interface SkillCategory {
  id?: string;
  title: string; titleFa?: string;
  order?: number;
  _count?: { skills: number };
}

@Component({
  selector: 'app-skill-categories',
  imports: [CommonModule, FormsModule],
  templateUrl: './skill-categories.component.html',
  styles: [`.font-fa { font-family: 'Vazirmatn', system-ui, sans-serif; }`],
})
export class SkillCategoriesComponent implements OnInit {
  model: SkillCategory = { title: '', order: 0 };
  items = signal<SkillCategory[]>([]);
  editId?: string;
  dirty = signal(false);

  markDirty(): void {
    this.dirty.set(true);
  }

  canDeactivate(): boolean {
    return !this.dirty();
  }

  constructor(
    private http: HttpClient,
    public i18n: AdminI18nService,
    private toast: ToastService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<SkillCategory[]>('/api/admin/skill-categories').subscribe((data) => this.items.set(data));
  }

  onSubmit(): void {
    const req = this.editId
      ? this.http.put(`/api/admin/skill-categories/${this.editId}`, this.model)
      : this.http.post('/api/admin/skill-categories', this.model);
    req.subscribe(() => {
      this.reset();
      this.load();
      this.dirty.set(false);
      this.toast.success(this.editId ? this.i18n.t('toast_updated') : this.i18n.t('toast_added'));
    });
  }

  edit(item: SkillCategory): void {
    this.model = { ...item };
    this.editId = item.id;
  }

  async del(id: string): Promise<void> {
    const cat = this.items().find((c) => c.id === id);
    const count = cat?._count?.skills ?? 0;
    const ok = await this.confirm.confirm({
      title: this.i18n.t('confirm_title'),
      message: count > 0
        ? `${this.i18n.t('confirm_delete')} (${count} ${this.i18n.t('cat_skillsCount')})`
        : this.i18n.t('confirm_delete'),
      confirmText: this.i18n.t('confirm_yes'),
      cancelText: this.i18n.t('confirm_no'),
      danger: true,
    });
    if (!ok) return;
    this.http.delete(`/api/admin/skill-categories/${id}`).subscribe(() => {
      this.load();
      this.toast.success(this.i18n.t('toast_deleted'));
    });
  }

  reset(): void {
    this.model = { title: '', order: 0 };
    this.editId = undefined;
    this.dirty.set(false);
  }
}
