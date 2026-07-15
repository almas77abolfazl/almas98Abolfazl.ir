import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { DatePickerComponent } from '../../core/components/date-picker.component';
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
  imports: [CommonModule, FormsModule, DragDropModule, DatePickerComponent],
  templateUrl: './experiences.component.html',
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

  reorder(event: CdkDragDrop<Experience[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const list = [...this.view()];
    const [moved] = list.splice(event.previousIndex, 1);
    list.splice(event.currentIndex, 0, moved);
    const items = list.map((it, i) => ({ id: it.id!, order: i }));
    this.sortCol.set(null);
    this.http.patch('/api/admin/experiences/reorder', { items }).subscribe({
      next: () => {
        this.load();
        this.toast.success(this.i18n.t('toast_updated'));
      },
      error: () => this.toast.error(this.i18n.t('save_failed')),
    });
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
