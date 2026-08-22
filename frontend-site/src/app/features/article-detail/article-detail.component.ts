import { Component, OnInit, signal, computed, HostListener, ChangeDetectionStrategy, afterNextRender, ViewChild, ElementRef, DestroyRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService, Article } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { ArticleDatePipe } from '../../shared/pipes/article-date.pipe';
import { SeoService } from '../../shared/services/seo.service';
import { SiteConfigService } from '../../shared/services/site-config.service';
import { MarkdownService } from '../../shared/services/markdown.service';

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, RouterLink, ArticleDatePipe],
  templateUrl: './article-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleDetailComponent implements OnInit {
  article = signal<Article | null>(null);
  loading = signal(true);
  liked = signal(false);
  likeCount = signal(0);
  progress = signal(0);
  toc = signal<{ id: string; text: string; level: 2 | 3 }[]>([]);
  activeId = signal<string>('');

  showBackToTop = computed(() => this.progress() > 12);

  contentHtml = computed<string>(() => {
    const art = this.article();
    if (!art?.content) return '';
    return this.markdownService.renderMarkdown(art.content);
  });

  @ViewChild('content') contentRef?: ElementRef<HTMLElement>;

  private tocObserver?: IntersectionObserver;
  private lastSlug?: string;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    public i18n: I18nService,
    private api: ApiService,
    private route: ActivatedRoute,
    private seo: SeoService,
    private config: SiteConfigService,
    private markdownService: MarkdownService,
    destroyRef: DestroyRef = inject(DestroyRef)
  ) {
    afterNextRender(() => {
      const art = this.article();
      if (!art) {
        return;
      }
      if (this.lastSlug === art.slug) {
        return;
      }
      this.lastSlug = art.slug;
      this.buildToc();
    });

    destroyRef.onDestroy(() => this.tocObserver?.disconnect());
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.getArticleBySlug(slug).subscribe({
      next: (data) => {
        this.article.set(data);
        this.likeCount.set(data.likeCount);
        if (this.isBrowser) {
          this.liked.set(localStorage.getItem(`liked_${slug}`) === '1');
        }
        this.loading.set(false);
        this.applySeo(data);
      },
      error: () => {
        this.loading.set(false);
        this.seo.update({
          title: this.i18n.t('articleNotFound'),
          description: this.i18n.t('seoBlogDesc'),
          path: `/blog/${slug}`,
        });
      },
    });
  }

  private applySeo(article: Article): void {
    const description = article.excerpt?.trim() || article.content.slice(0, 160);
    const path = `/blog/${article.slug}`;
    this.seo.update({
      title: article.title,
      description,
      image: article.coverUrl,
      path,
      type: 'article',
    });

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description,
      author: { '@type': 'Person', name: this.config.displayName() },
      inLanguage: article.language,
      dateModified: article.updatedAt,
    };
    if (article.publishedAt) {
      schema['datePublished'] = article.publishedAt;
    }
    schema['image'] = this.config.resolveImage(article.coverUrl);
    this.seo.setJsonLd(schema);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser) {
      return;
    }
    const el = document.documentElement;
    const height = el.scrollHeight - el.clientHeight;
    this.progress.set(height > 0 ? Math.min(100, (el.scrollTop / height) * 100) : 0);
  }

  toggleLike(): void {
    const art = this.article();
    if (!art) {
      return;
    }
    if (this.liked()) {
      this.api.unlikeArticle(art.slug).subscribe({
        next: (res) => {
          this.likeCount.set(res.likeCount);
          this.liked.set(false);
          if (this.isBrowser) {
            localStorage.removeItem(`liked_${art.slug}`);
          }
        },
      });
    } else {
      this.api.likeArticle(art.slug).subscribe({
        next: (res) => {
          this.likeCount.set(res.likeCount);
          this.liked.set(true);
          if (this.isBrowser) {
            localStorage.setItem(`liked_${art.slug}`, '1');
          }
        },
      });
    }
  }

  copyTocClick(id: string): void {
    if (!this.isBrowser) {
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollTop(): void {
    if (!this.isBrowser) {
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private buildToc(): void {
    if (!this.isBrowser) {
      return;
    }
    const host = this.contentRef?.nativeElement;
    if (!host) {
      return;
    }

    this.enhanceCodeBlocks(host);

    const headings = Array.from(host.querySelectorAll('h2, h3')) as HTMLElement[];
    if (headings.length < 2) {
      this.toc.set([]);
      this.activeId.set('');
      this.tocObserver?.disconnect();
      this.tocObserver = undefined;
      return;
    }

    const seen = new Map<string, number>();
    const items: { id: string; text: string; level: 2 | 3 }[] = [];
    for (const el of headings) {
      const text = (el.textContent ?? '').trim();
      const base = this.slugify(text) || 'section';
      let id = base;
      let n = seen.get(base) ?? 0;
      while (seen.has(id)) {
        n++;
        id = `${base}-${n}`;
      }
      seen.set(base, n + 1);
      seen.set(id, 1);
      el.id = id;
      items.push({ id, text, level: el.tagName === 'H2' ? 2 : 3 });
    }
    this.toc.set(items);
    this.activeId.set(items[0].id);

    this.tocObserver?.disconnect();
    const visible = new Set<string>();
    this.tocObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) {
            visible.add(id);
          } else {
            visible.delete(id);
          }
        }
        let topId = '';
        let topY = Infinity;
        if (visible.size) {
          for (const id of visible) {
            const el = document.getElementById(id);
            if (!el) {
              continue;
            }
            const y = el.getBoundingClientRect().top;
            if (y < topY) {
              topY = y;
              topId = id;
            }
          }
        }
        if (!topId) {
          let lastAbove = '';
          for (const item of items) {
            const el = document.getElementById(item.id);
            if (el && el.getBoundingClientRect().top < 120) {
              lastAbove = item.id;
            }
          }
          topId = lastAbove || items[0].id;
        }
        this.activeId.set(topId);
      },
      { rootMargin: '0px 0px -65% 0px', threshold: 0 }
    );
    for (const el of headings) {
      this.tocObserver.observe(el);
    }
  }

  private enhanceCodeBlocks(host: HTMLElement): void {
    const pres = Array.from(host.querySelectorAll('pre')) as HTMLElement[];
    for (const pre of pres) {
      if (pre.getAttribute('data-copy') === '1') {
        continue;
      }
      pre.setAttribute('data-copy', '1');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code');
        const text = (code?.textContent ?? pre.textContent ?? '').trim();
        navigator.clipboard?.writeText(text).then(() => {
          btn.textContent = 'Copied';
          setTimeout(() => {
            btn.textContent = 'Copy';
          }, 1500);
        });
      });
      pre.appendChild(btn);
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
