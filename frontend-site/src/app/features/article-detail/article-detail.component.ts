import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService, Article } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      <a routerLink="/blog"
        class="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-10 group transition-colors">
        <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        {{ i18n.isFa ? 'بازگشت به مقالات' : 'Back to Blog' }}
      </a>

      @if (loading) {
        <div class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (article) {
        <article>
          @if (article.coverUrl) {
            <div class="w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
              <img [src]="article.coverUrl" [alt]="i18n.isFa ? (article.titleFa || article.title) : article.title"
                class="w-full h-full object-cover">
            </div>
          }

          <h1 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            {{ i18n.isFa ? (article.titleFa || article.title) : article.title }}
          </h1>

          @if (article.publishedAt) {
            <p class="text-sm text-slate-400 dark:text-slate-500 mb-8">
              {{ article.publishedAt | date:'longDate' }}
            </p>
          }

          <div class="divider mb-8"></div>

          <div class="text-slate-700 dark:text-slate-300 leading-8 whitespace-pre-wrap text-base">
            {{ i18n.isFa ? (article.contentFa || article.content) : article.content }}
          </div>
        </article>
      } @else {
        <div class="text-center py-20">
          <p class="text-slate-400 dark:text-slate-500">{{ i18n.isFa ? 'مقاله یافت نشد' : 'Article not found' }}</p>
          <a routerLink="/blog" class="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
            {{ i18n.isFa ? 'بازگشت' : 'Go back' }}
          </a>
        </div>
      }

    </section>
  `,
})
export class ArticleDetailComponent implements OnInit {
  article: Article | null = null;
  loading = true;

  constructor(public i18n: I18nService, private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.getArticleBySlug(slug).subscribe({
      next: (data) => { this.article = data; this.loading = false; },
      error: () => (this.loading = false),
    });
  }
}
