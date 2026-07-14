import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { I18nService } from './i18n.service';
import { SITE_URL, SITE_NAME, AUTHOR_NAME, AUTHOR_NAME_FA, DEFAULT_OG_IMAGE } from '../site-config';

function cleanUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Holds site-wide configuration that may be edited by the owner (site name,
 * canonical URL) or derived from the AboutMe record (owner name). Values are
 * initialised with sensible fallbacks and refreshed at bootstrap from the API
 * so the public site never needs a hard-coded domain or owner name.
 */
@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);

  readonly siteUrl = signal(cleanUrl(SITE_URL));
  readonly siteName = signal(SITE_NAME);
  readonly authorName = signal(AUTHOR_NAME);
  readonly authorNameFa = signal(AUTHOR_NAME_FA);
  readonly ogImage = signal(DEFAULT_OG_IMAGE);

  constructor() {
    this.load();
  }

  private load(): void {
    this.api.getSettings().subscribe({
      next: (s) => {
        if (s.siteUrl) this.siteUrl.set(cleanUrl(s.siteUrl));
        if (s.siteName) this.siteName.set(s.siteName);
        this.ogImage.set(`${this.siteUrl()}/og-default.png`);
      },
      error: () => {},
    });

    this.api.getAboutMe().subscribe({
      next: (a) => {
        if (a.fullName) this.authorName.set(a.fullName);
        if (a.fullNameFa) this.authorNameFa.set(a.fullNameFa);
      },
      error: () => {},
    });
  }

  /** Owner name appropriate for the active UI language (FA falls back to EN). */
  displayName(): string {
    return this.i18n.isFa && this.authorNameFa() ? this.authorNameFa() : this.authorName();
  }

  /** First letter of the site/brand mark, used for the logo glyph. */
  brandInitial(): string {
    const source = this.siteName() || this.displayName();
    return (source.trim().charAt(0) || 'A').toUpperCase();
  }

  absoluteUrl(path?: string): string {
    const pathname = path ?? (typeof location !== 'undefined' ? location.pathname : '/');
    if (/^https?:\/\//i.test(pathname)) {
      return pathname;
    }
    return `${this.siteUrl()}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
  }

  resolveImage(image?: string): string {
    if (!image) {
      return this.ogImage();
    }
    if (/^https?:\/\//i.test(image)) {
      return image;
    }
    return `${this.siteUrl()}${image.startsWith('/') ? '' : '/'}${image}`;
  }

  /**
   * Returns a same-origin (relative) URL for assets served by this app's backend
   * (e.g. uploaded files under `/api/uploads`). Keeping these relative ensures the
   * browser honours the `download` attribute and stays on the same page instead of
   * opening a new tab or navigating cross-origin.
   */
  assetUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    return url.startsWith('/') ? url : `/${url}`;
  }
}
