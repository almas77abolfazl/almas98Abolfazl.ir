import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { I18nService } from './i18n.service';
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from '../site-config';

export interface SeoData {
  /** Page title (without the site-name suffix). */
  title: string;
  description?: string;
  /** Absolute or relative image URL. Relative URLs are resolved against SITE_URL. */
  image?: string;
  /** Route path (e.g. '/blog'). Defaults to the current location pathname. */
  path?: string;
  /** Open Graph type. Defaults to 'website'. */
  type?: 'website' | 'article' | 'profile';
}

const JSON_LD_ID = 'seo-json-ld';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly i18n: I18nService,
  ) {}

  /** Sets the document title as `Page | Site Name`. */
  setTitle(pageTitle: string): void {
    this.title.setTitle(`${pageTitle} | ${SITE_NAME}`);
  }

  /** Applies the full set of SEO meta tags (title, description, Open Graph, Twitter, canonical). */
  update(data: SeoData): void {
    // Remove any structured data from a previous page; pages that need it re-add via setJsonLd().
    this.clearJsonLd();

    const url = this.absoluteUrl(data.path);
    const image = this.resolveImage(data.image);
    const description = data.description?.trim() || '';
    const type = data.type ?? 'website';
    const locale = this.i18n.currentLang() === 'fa' ? 'fa_IR' : 'en_US';

    this.setTitle(data.title);
    const fullTitle = `${data.title} | ${SITE_NAME}`;

    this.setTag('description', description);

    // Open Graph
    this.setProperty('og:title', fullTitle);
    this.setProperty('og:description', description);
    this.setProperty('og:type', type);
    this.setProperty('og:url', url);
    this.setProperty('og:site_name', SITE_NAME);
    this.setProperty('og:locale', locale);
    this.setProperty('og:image', image);

    // Twitter Card
    this.setTag('twitter:card', 'summary_large_image');
    this.setTag('twitter:title', fullTitle);
    this.setTag('twitter:description', description);
    this.setTag('twitter:image', image);

    this.setCanonical(url);
  }

  /** Injects (or replaces) a JSON-LD structured-data script in <head>. */
  setJsonLd(schema: Record<string, unknown>): void {
    let script = this.document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.id = JSON_LD_ID;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }

  /** Removes any previously injected JSON-LD (call when leaving a page that set one). */
  clearJsonLd(): void {
    this.document.getElementById(JSON_LD_ID)?.remove();
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setTag(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }

  private absoluteUrl(path?: string): string {
    const pathname = path ?? this.document.location.pathname;
    if (/^https?:\/\//i.test(pathname)) {
      return pathname;
    }
    return `${SITE_URL}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
  }

  private resolveImage(image?: string): string {
    if (!image) {
      return DEFAULT_OG_IMAGE;
    }
    if (/^https?:\/\//i.test(image)) {
      return image;
    }
    return `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
  }
}
