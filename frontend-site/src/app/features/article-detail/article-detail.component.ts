import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService, Article } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Reading progress bar -->
    <div class="fixed top-0 inset-x-0 h-1 z-[60] bg-transparent">
      <div class="h-full bg-linear-to-r from-indigo-500 to-emerald-500 transition-[width] duration-75"
        [style.width.%]="progress()"></div>
    </div>

    <section class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      <a routerLink="/blog"
        class="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-10 group transition-colors">
        <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        {{ i18n.t('backToBlog') }}
      </a>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (article(); as art) {
        <article>
          @if (art.coverUrl) {
            <div class="w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
              <img [src]="art.coverUrl" [alt]="art.title" class="w-full h-full object-cover">
            </div>
          }

          <h1 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight"
            [dir]="art.language === 'fa' ? 'rtl' : 'ltr'">
            {{ art.title }}
          </h1>

          <!-- Meta row: date, language badge, reading time -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-slate-400 dark:text-slate-500 mb-6">
            @if (art.publishedAt) {
              <span>{{ art.publishedAt | date:'longDate' }}</span>
            }
            <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 uppercase">
              {{ art.language === 'fa' ? 'FA' : 'EN' }}
            </span>
            @if (art.readingTime) {
              <span class="inline-flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ art.readingTime }} {{ i18n.t('minRead') }}
              </span>
            }
          </div>

          @if (art.tags.length) {
            <div class="flex flex-wrap gap-2 mb-6">
              @for (tag of art.tags; track tag) {
                <span class="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {{ tag }}
                </span>
              }
            </div>
          }

          <div class="divider mb-8"></div>

          <div class="text-slate-700 dark:text-slate-300 leading-8 whitespace-pre-wrap text-base"
            [dir]="art.language === 'fa' ? 'rtl' : 'ltr'">
            {{ art.content }}
          </div>

          <!-- Like button -->
          <div class="mt-12 flex items-center justify-center">
            <button type="button" (click)="like()" [disabled]="liked()"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-colors disabled:cursor-default"
              [class]="liked()
                ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400'
                : 'bg-white border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-rose-400'">
              <svg class="w-5 h-5" [attr.fill]="liked() ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{{ liked() ? i18n.t('liked') : i18n.t('like') }}</span>
              <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-xs">
                {{ likeCount() }}
              </span>
            </button>
          </div>
        </article>
      } @else {
        <div class="text-center py-20">
          <p class="text-slate-400 dark:text-slate-500">{{ i18n.t('articleNotFound') }}</p>
          <a routerLink="/blog" class="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
            {{ i18n.t('goBack') }}
          </a>
        </div>
      }

    </section>
  `,
})
export class ArticleDetailComponent implements OnInit {
  article = signal<Article | null>(null);
  loading = signal(true);
  liked = signal(false);
  likeCount = signal(0);
  progress = signal(0);

  constructor(public i18n: I18nService, private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.getArticleBySlug(slug).subscribe({
      next: (data) => {
        this.article.set(data);
        this.likeCount.set(data.likeCount);
        this.liked.set(localStorage.getItem(`liked_${slug}`) === '1');
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
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
