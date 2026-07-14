import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

interface Skill {
  id?: string;
  name: string; nameFa?: string;
  category: string; categoryFa?: string;
  categoryId?: string;
  proficiency?: number;
}

interface SkillCategoryOption {
  id: string;
  title: string; titleFa?: string;
}

type SortCol = 'name' | 'category' | 'proficiency' | null;

@Component({
  selector: 'app-skills',
  imports: [CommonModule, FormsModule, DragDropModule, RouterLink],
  templateUrl: './skills.component.html',
  styles: [`.font-fa { font-family: 'Vazirmatn', system-ui, sans-serif; }`],
})
export class SkillsComponent implements OnInit {
  model: Skill = { name: '', category: '' };
  items = signal<Skill[]>([]);
  categories = signal<SkillCategoryOption[]>([]);
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

  ngOnInit(): void {
    this.loadCategories();
    this.load();
  }

  loadCategories(): void {
    this.http.get<SkillCategoryOption[]>('/api/admin/skill-categories').subscribe((data) => this.categories.set(data));
  }

  load(): void {
    this.http.get<Skill[]>('/api/admin/skills').subscribe((data) => this.items.set(data));
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

  reorder(event: CdkDragDrop<Skill[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const list = [...this.view()];
    const [moved] = list.splice(event.previousIndex, 1);
    list.splice(event.currentIndex, 0, moved);
    const items = list.map((it, i) => ({ id: it.id!, order: i }));
    this.sortCol.set(null);
    this.http.patch('/api/admin/skills/reorder', { items }).subscribe({
      next: () => {
        this.load();
        this.toast.success(this.i18n.t('toast_updated'));
      },
      error: () => this.toast.error(this.i18n.t('save_failed')),
    });
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

  onCategoryChange(): void {
    const cat = this.categories().find((c) => c.id === this.model.categoryId);
    if (cat) {
      this.model.category = cat.title;
      if (!this.model.categoryFa) this.model.categoryFa = cat.titleFa;
    }
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
