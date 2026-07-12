import { Component, OnInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { marked } from 'marked';
import { ApiService, Article } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';
import { AUTHOR_NAME } from '../../shared/site-config';

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './article-detail.component.html',
})
export class ArticleDetailComponent implements OnInit {
  article = signal<Article | null>(null);
  loading = signal(true);
  liked = signal(false);
  likeCount = signal(0);
  progress = signal(0);

  contentHtml = computed<string>(() => {
    const art = this.article();
    if (!art?.content) return '';
    return marked.parse(art.content, { async: false }) as string;
  });

  constructor(public i18n: I18nService, private api: ApiService, private route: ActivatedRoute, private seo: SeoService) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.getArticleBySlug(slug).subscribe({
      next: (data) => {
        this.article.set(data);
        this.likeCount.set(data.likeCount);
        this.liked.set(localStorage.getItem(`liked_${slug}`) === '1');
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
      author: { '@type': 'Person', name: AUTHOR_NAME },
      inLanguage: article.language,
      dateModified: article.updatedAt,
    };
    if (article.publishedAt) {
      schema['datePublished'] = article.publishedAt;
    }
    if (article.coverUrl) {
      schema['image'] = article.coverUrl;
    }
    this.seo.setJsonLd(schema);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const el = document.documentElement;
    const height = el.scrollHeight - el.clientHeight;
    this.progress.set(height > 0 ? Math.min(100, (el.scrollTop / height) * 100) : 0);
  }

  like(): void {
    const art = this.article();
    if (this.liked() || !art) {
      return;
    }
    this.api.likeArticle(art.slug).subscribe({
      next: (res) => {
        this.likeCount.set(res.likeCount);
        this.liked.set(true);
        localStorage.setItem(`liked_${art.slug}`, '1');
      },
    });
  }
}
