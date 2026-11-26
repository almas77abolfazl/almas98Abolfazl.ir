import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { I18nService } from './i18n.service';
import { SiteConfigService } from './site-config.service';

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
  /** Content language when it differs from the current UI language. */
  language?: string;
  /** When true, adds a `robots: noindex` tag (e.g. for the 404 page). Defaults to false. */
  noindex?: boolean;
}

const JSON_LD_ID = 'seo-json-ld';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly i18n: I18nService,
    private readonly config: SiteConfigService,
  ) {}

  /** Sets the document title as `Page | Site Name`, without duplicating the home/site title. */
  setTitle(pageTitle: string): void {
    this.title.setTitle(this.fullTitle(pageTitle));
  }

  /** Applies the full set of SEO meta tags (title, description, Open Graph, Twitter, canonical). */
  update(data: SeoData): void {
    // Remove any structured data from a previous page; pages that need it re-add via setJsonLd().
    this.clearJsonLd();

    const basePath = this.i18n.stripLangPrefix(data.path ?? '/');
    const enPath = basePath;
    const faPath = basePath === '/' ? '/fa' : `/fa${basePath}`;
    const activePath = this.i18n.isFa ? faPath : enPath;

    const url = this.config.absoluteUrl(activePath);
    const enUrl = this.config.absoluteUrl(enPath);
    const faUrl = this.config.absoluteUrl(faPath);
    const image = this.config.resolveImage(data.image);
    const description = (data.description?.trim() || '').replace(/\{name\}/g, this.config.displayName());
    const type = data.type ?? 'website';
    const locale = data.language === 'fa'
      ? 'fa_IR'
      : data.language === 'en'
        ? 'en_US'
        : this.i18n.currentLang() === 'fa' ? 'fa_IR' : 'en_US';

    this.setTitle(data.title);
    const fullTitle = this.fullTitle(data.title);

    this.setTag('description', description);
    this.setTag('author', this.config.displayName());

    // Reset robots on every page so a previous noindex (e.g. 404) doesn't leak.
    this.setTag('robots', data.noindex ? 'noindex, follow' : 'index, follow');

    // Open Graph
    this.setProperty('og:title', fullTitle);
    this.setProperty('og:description', description);
    this.setProperty('og:type', type);
    this.setProperty('og:url', url);
    this.setProperty('og:site_name', this.config.siteName());
    this.setProperty('og:locale', locale);
    this.setProperty('og:image', image);

    // Twitter Card
    this.setTag('twitter:card', 'summary_large_image');
    this.setTag('twitter:title', fullTitle);
    this.setTag('twitter:description', description);
    this.setTag('twitter:image', image);

    this.setCanonical(url);
    if (data.noindex) {
      this.clearHreflang();
    } else {
      this.setHreflang(enUrl, faUrl);
    }
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

  private setHreflang(enUrl: string, faUrl: string): void {
    const entries: Array<[string, string]> = [
      ['en', enUrl],
      ['fa', faUrl],
      ['x-default', enUrl],
    ];
    for (const [lang, href] of entries) {
      let link = this.document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${lang}"]`);
      if (!link) {
        link = this.document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', lang);
        this.document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    }
  }

  private clearHreflang(): void {
    this.document
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((el) => el.remove());
  }

  private fullTitle(pageTitle: string): string {
    const siteName = this.config.siteName();
    return pageTitle.trim() === siteName.trim()
      ? siteName
      : `${pageTitle} | ${siteName}`;
  }

  private setTag(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }
}
