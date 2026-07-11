import { Component, signal, effect } from '@angular/core';
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
          {{ i18n.t('writing') }}
        </p>
        <h1 class="text-4xl font-bold text-slate-900 dark:text-white">{{ i18n.t('articles') }}</h1>
        <div class="mt-4 w-16 h-1 rounded-full bg-linear-to-r from-indigo-500 to-emerald-500"></div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (articles().length === 0) {
        <div class="text-center py-20 text-slate-400 dark:text-slate-500">
          {{ i18n.t('noArticles') }}
        </div>
      } @else {
        <div class="grid md:grid-cols-2 gap-6">
          @for (article of articles(); track article.id) {
            <a [routerLink]="['/blog', article.slug]"
              class="block bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 card-hover group">
              @if (article.coverUrl) {
                <div class="w-full h-40 rounded-xl overflow-hidden mb-4">
                  <img [src]="article.coverUrl" [alt]="article.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                </div>
              }
              <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {{ article.title }}
              </h2>
              @if (article.excerpt) {
                <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
                  {{ article.excerpt }}
                </p>
              }

              @if (article.tags.length) {
                <div class="flex flex-wrap gap-2 mb-4">
                  @for (tag of article.tags; track tag) {
                    <span class="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      {{ tag }}
                    </span>
                  }
                </div>
              }

              <div class="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                <div class="flex items-center gap-3">
                  <span>{{ article.publishedAt | date:'mediumDate' }}</span>
                  @if (article.readingTime) {
                    <span class="inline-flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ article.readingTime }} {{ i18n.t('minRead') }}
                    </span>
                  }
                  <span class="inline-flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {{ article.likeCount }}
                  </span>
                </div>
                <span class="font-semibold text-indigo-600 dark:text-indigo-400">{{ i18n.t('readMore') }} →</span>
              </div>
            </a>
          }
        </div>
      }

    </section>
  `,
})
export class BlogComponent {
  articles = signal<Article[]>([]);
  loading = signal(true);

  constructor(public i18n: I18nService, private api: ApiService) {
    // Re-fetch whenever the active language changes.
    effect(() => {
      const lang = this.i18n.currentLang();
      this.loadArticles(lang);
    });
  }

  private loadArticles(lang: string): void {
    this.loading.set(true);
    this.api.getArticles(lang).subscribe({
      next: (data) => {
        this.articles.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
