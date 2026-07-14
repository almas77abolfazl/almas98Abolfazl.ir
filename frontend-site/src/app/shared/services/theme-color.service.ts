import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SiteSettings } from './api.service';

interface StoredTheme {
  primary: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  primaryRgb: string;
  secondaryRgb: string;
}

const THEME_VARS = [
  '--brand-primary',
  '--brand-primary-light',
  '--brand-secondary',
  '--brand-secondary-light',
  '--brand-primary-rgb',
  '--brand-secondary-rgb',
] as const;

function normalizeHex(hex: string): string {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return h;
}

function isValidHex(hex: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim());
}

function hexToRgb(hex: string): string {
  const h = normalizeHex(hex);
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function lighten(hex: string, ratio: number): string {
  const h = normalizeHex(hex);
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const nr = Math.round(r + (255 - r) * ratio);
  const ng = Math.round(g + (255 - g) * ratio);
  const nb = Math.round(b + (255 - b) * ratio);
  return `#${[nr, ng, nb]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
}

@Injectable({ providedIn: 'root' })
export class ThemeColorService {
  private readonly storageKey = 'site_theme';

  constructor(private api: ApiService) {}

  loadAndApply(): void {
    this.api.getSettings().subscribe({
      next: (s) => this.applyFromSettings(s),
      error: () => {},
    });
  }

  applyFromSettings(s: SiteSettings): void {
    if (s.themeMode === 'custom' && isValidHex(s.themePrimary ?? '') && isValidHex(s.themeSecondary ?? '')) {
      this.apply(s.themePrimary as string, s.themeSecondary as string);
    } else {
      this.clear();
    }
  }

  apply(primary: string, secondary: string): void {
    const primaryLight = lighten(primary, 0.25);
    const secondaryLight = lighten(secondary, 0.25);
    const root = document.documentElement.style;
    root.setProperty('--brand-primary', primary);
    root.setProperty('--brand-primary-light', primaryLight);
    root.setProperty('--brand-secondary', secondary);
    root.setProperty('--brand-secondary-light', secondaryLight);
    root.setProperty('--brand-primary-rgb', hexToRgb(primary));
    root.setProperty('--brand-secondary-rgb', hexToRgb(secondary));

    const stored: StoredTheme = {
      primary,
      primaryLight,
      secondary,
      secondaryLight,
      primaryRgb: hexToRgb(primary),
      secondaryRgb: hexToRgb(secondary),
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(stored));
    } catch {
      /* storage may be unavailable */
    }
  }

  clear(): void {
    const root = document.documentElement.style;
    THEME_VARS.forEach((v) => root.removeProperty(v));
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      /* storage may be unavailable */
    }
  }
}
