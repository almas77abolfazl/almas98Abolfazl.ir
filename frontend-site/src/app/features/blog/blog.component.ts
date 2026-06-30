import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Article } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-blog',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      <div class="mb-12">
        <p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">
          {{ i18n.isFa ? 'نوشته‌ها' : 'Writing' }}
        </p>
        <h1 class="text-4xl font-bold text-slate-900 dark:text-white">{{ i18n.t('articles') }}</h1>
        <div class="mt-4 w-16 h-1 rounded-full bg-linear-to-r from-indigo-500 to-emerald-500"></div>
      </div>

      @if (loading) {
        <div class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (articles.length === 0) {
        <div class="text-center py-20 text-slate-400 dark:text-slate-500">
          {{ i18n.isFa ? 'مقاله‌ای یافت نشد' : 'No articles yet' }}
        </div>
      } @else {
        <div class="grid md:grid-cols-2 gap-6">
          @for (article of articles; track article.id) {
            <a [routerLink]="['/blog', article.slug]"
              class="block bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 card-hover group">
              @if (article.coverUrl) {
                <div class="w-full h-40 rounded-xl overflow-hidden mb-4">
                  <img [src]="article.coverUrl" [alt]="i18n.isFa ? (article.titleFa || article.title) : article.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                </div>
              }
              <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {{ i18n.isFa ? (article.titleFa || article.title) : article.title }}
              </h2>
              @if (article.excerpt || article.excerptFa) {
                <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
                  {{ i18n.isFa ? (article.excerptFa || article.excerpt) : article.excerpt }}
                </p>
              }
              <div class="flex items-center justify-between">
                <p class="text-xs text-slate-400 dark:text-slate-500">{{ article.publishedAt | date:'mediumDate' }}</p>
                <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{{ i18n.t('readMore') }} →</span>
              </div>
            </a>
          }
        </div>
      }

    </section>
  `,
})
export class BlogComponent implements OnInit {
  articles: Article[] = [];
  loading = true;

  constructor(public i18n: I18nService, private api: ApiService) {}

  ngOnInit(): void {
    this.api.getArticles().subscribe({
      next: (data) => { this.articles = data.filter(a => a.published); this.loading = false; },
      error: () => (this.loading = false),
    });
  }
}
