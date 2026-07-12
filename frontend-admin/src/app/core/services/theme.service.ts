import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'admin_theme';
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');

  isDark = signal<boolean>(false);

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    this.isDark.set(stored ? stored === 'dark' : this.media.matches);
    this.applyTheme(this.isDark());
    effect(() => this.applyTheme(this.isDark()));

    this.media.addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.isDark.set(e.matches);
      }
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
    localStorage.setItem(this.storageKey, this.isDark() ? 'dark' : 'light');
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
  }
}
