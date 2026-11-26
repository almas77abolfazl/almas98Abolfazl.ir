import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';
import { I18nService } from './i18n.service';
import { SiteConfigService } from './site-config.service';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;
  let doc: Document;
  let mockIsFa = false;

  beforeEach(() => {
    mockIsFa = false;
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SeoService,
        {
          provide: I18nService,
          useValue: {
            currentLang: () => (mockIsFa ? 'fa' : 'en'),
            get isFa() {
              return mockIsFa;
            },
            stripLangPrefix: (url: string) => {
              const path = (url || '/').split(/[?#]/)[0] || '/';
              if (path === '/fa' || path === '/fa/') return '/';
              return path.startsWith('/fa/') ? path.slice(3) || '/' : path;
            },
          },
        },
        {
          provide: SiteConfigService,
          useValue: {
            siteName: () => (mockIsFa ? 'ابوالفضل نصیری الماس' : 'Abolfazl Almas'),
            displayName: () => (mockIsFa ? 'ابوالفضل نصیری الماس' : 'Abolfazl Almas'),
            absoluteUrl: (path?: string) => `https://almas98abolfazl.ir${path ?? '/'}`,
            resolveImage: (img?: string) => img || 'https://almas98abolfazl.ir/og-default.jpg',
          },
        },
      ],
    });

    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
  });

  it('formats page titles with site name suffix without duplicating site name', () => {
    service.setTitle('Blog');
    expect(titleService.getTitle()).toBe('Blog | Abolfazl Almas');

    service.setTitle('Abolfazl Almas');
    expect(titleService.getTitle()).toBe('Abolfazl Almas');
  });

  it('sets Open Graph, canonical URL, hreflang, and robots meta tags on update', () => {
    service.update({
      title: 'My Post',
      description: 'Read about {name}',
      path: '/blog/my-post',
      type: 'article',
    });

    expect(metaService.getTag('property="og:title"')?.content).toBe('My Post | Abolfazl Almas');
    expect(metaService.getTag('property="og:url"')?.content).toBe('https://almas98abolfazl.ir/blog/my-post');
    expect(metaService.getTag('property="og:type"')?.content).toBe('article');
    expect(metaService.getTag('name="description"')?.content).toBe('Read about Abolfazl Almas');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
    expect(doc.querySelector('link[rel="alternate"][hreflang="fa"]')?.getAttribute('href')).toBe(
      'https://almas98abolfazl.ir/fa/blog/my-post',
    );
  });

  it('uses /fa canonical and fa_IR locale when Persian mode is active', () => {
    mockIsFa = true;
    service.update({
      title: 'ابوالفضل نصیری الماس',
      description: 'نمونه کار {name}',
      path: '/',
    });

    expect(metaService.getTag('property="og:url"')?.content).toBe('https://almas98abolfazl.ir/fa');
    expect(metaService.getTag('property="og:locale"')?.content).toBe('fa_IR');
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://almas98abolfazl.ir/fa',
    );
  });
});
