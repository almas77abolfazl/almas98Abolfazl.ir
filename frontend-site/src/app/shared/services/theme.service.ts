import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'app_theme';

  isDark = signal<boolean>(false);

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDark.set(stored ? stored === 'dark' : prefersDark);
    this.applyTheme(this.isDark());
    effect(() => this.applyTheme(this.isDark()));
  }

  toggle(): void {
    this.isDark.update(v => !v);
    localStorage.setItem(this.storageKey, this.isDark() ? 'dark' : 'light');
  }

  private applyTheme(dark: boolean): void {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}
