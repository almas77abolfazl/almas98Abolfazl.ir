import { Component, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Article } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-blog',
  imports: [CommonModule, RouterLink],
  templateUrl: './blog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogComponent {
  articles = signal<Article[]>([]);
  loading = signal(true);

  constructor(public i18n: I18nService, private api: ApiService, private seo: SeoService) {
    this.seo.update({
      title: this.i18n.t('articles'),
      description: this.i18n.t('seoBlogDesc'),
      path: '/blog',
    });

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
