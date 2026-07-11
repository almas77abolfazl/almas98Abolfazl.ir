import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'app_theme';
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');

  isDark = signal<boolean>(false);

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    this.isDark.set(stored ? stored === 'dark' : this.media.matches);
    this.applyTheme(this.isDark());
    effect(() => this.applyTheme(this.isDark()));

    // Follow the OS theme live, but only while the user hasn't made an explicit choice.
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
    const html = document.documentElement;
    html.classList.toggle('dark', dark);

    // Keep the browser UI chrome (mobile address bar) in sync with the theme.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', dark ? '#0f0f17' : '#6a45e8');
    }
  }
}
