import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';
import { I18nService } from './i18n.service';
import { SiteConfigService } from './site-config.service';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SeoService,
        {
          provide: I18nService,
          useValue: { currentLang: () => 'en' },
        },
        {
          provide: SiteConfigService,
          useValue: {
            siteName: () => 'Abolfazl Almas',
            displayName: () => 'Abolfazl Almas',
            absoluteUrl: (path?: string) => `https://almas98abolfazl.ir${path ?? '/'}`,
            resolveImage: (img?: string) => img || 'https://almas98abolfazl.ir/og-default.jpg',
          },
        },
      ],
    });

    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
  });

  it('formats page titles with site name suffix without duplicating site name', () => {
    service.setTitle('Blog');
    expect(titleService.getTitle()).toBe('Blog | Abolfazl Almas');

    service.setTitle('Abolfazl Almas');
    expect(titleService.getTitle()).toBe('Abolfazl Almas');
  });

  it('sets Open Graph, canonical URL, and robots meta tags on update', () => {
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
  });
});
