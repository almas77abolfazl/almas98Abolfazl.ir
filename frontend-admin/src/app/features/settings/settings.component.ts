import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastService } from '../../core/services/toast.service';

interface AdminSettings {
  skillsCardView: boolean;
  themeMode?: string;
  themePrimary?: string | null;
  themeSecondary?: string | null;
}

interface ThemePreset {
  id: string;
  nameKey: string;
  primary: string;
  secondary: string;
}

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  settings = signal<AdminSettings>({ skillsCardView: false });

  themePresets: ThemePreset[] = [
    { id: 'iris', nameKey: 'theme_preset_iris', primary: '#6a45e8', secondary: '#d47bf7' },
    { id: 'crimson', nameKey: 'theme_preset_crimson', primary: '#e11d48', secondary: '#fb7185' },
    { id: 'azure', nameKey: 'theme_preset_azure', primary: '#2563eb', secondary: '#38bdf8' },
    { id: 'amber', nameKey: 'theme_preset_amber', primary: '#f59e0b', secondary: '#fbbf24' },
  ];
  mode = signal<'default' | 'custom'>('default');
  primary = signal<string>('#6a45e8');
  secondary = signal<string>('#d47bf7');
  gradient = computed(() => `linear-gradient(135deg, ${this.primary()}, ${this.secondary()})`);

  constructor(
    private http: HttpClient,
    public i18n: AdminI18nService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.http.get<AdminSettings>('/api/admin/settings').subscribe({
      next: (s) => {
        this.settings.set(s);
        const isCustom = s.themeMode === 'custom' && !!s.themePrimary && !!s.themeSecondary;
        this.mode.set(isCustom ? 'custom' : 'default');
        if (isCustom) {
          this.primary.set(s.themePrimary as string);
          this.secondary.set(s.themeSecondary as string);
        }
      },
      error: () => {},
    });
  }

  toggleCardView(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.settings.update((s) => ({ ...s, skillsCardView: checked }));
    this.http.put('/api/admin/settings', { skillsCardView: checked }).subscribe({
      next: () => this.toast.success(this.i18n.t('toast_saved')),
      error: () => this.toast.error(this.i18n.t('save_failed')),
    });
  }

  private persistTheme(): void {
    const body =
      this.mode() === 'default'
        ? { themeMode: 'default', themePrimary: null, themeSecondary: null }
        : { themeMode: 'custom', themePrimary: this.primary(), themeSecondary: this.secondary() };
    this.http.put('/api/admin/settings', body).subscribe({
      next: () => this.toast.success(this.i18n.t('toast_saved')),
      error: () => this.toast.error(this.i18n.t('save_failed')),
    });
  }

  selectDefault(): void {
    this.mode.set('default');
    this.persistTheme();
  }

  selectCustom(): void {
    if (this.mode() === 'custom') return;
    this.mode.set('custom');
    this.persistTheme();
  }

  applyPreset(p: ThemePreset): void {
    this.mode.set('custom');
    this.primary.set(p.primary);
    this.secondary.set(p.secondary);
    this.persistTheme();
  }

  setPrimary(v: string): void {
    this.primary.set(v);
    this.onCustomColorChange();
  }

  setSecondary(v: string): void {
    this.secondary.set(v);
    this.onCustomColorChange();
  }

  onCustomColorChange(): void {
    if (this.mode() !== 'custom') this.mode.set('custom');
    this.persistTheme();
  }
}
