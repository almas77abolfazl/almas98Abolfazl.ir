import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <a routerLink="/blog" class="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">&larr; Back to Blog</a>
      <div *ngIf="loading" class="text-gray-500 dark:text-gray-400">Loading...</div>
      <article *ngIf="!loading && article" class="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-4">{{ article.title }}</h1>
        <p *ngIf="article.publishedAt" class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ article.publishedAt | date:'mediumDate' }}</p>
        <div class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ article.content }}</div>
      </article>
      <div *ngIf="!loading && !article" class="text-red-500">Article not found.</div>
    </div>
  `,
  styles: [],
})
export class ArticleDetailComponent implements OnInit {
  article: any = null;
  loading = true;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.http.get<any>(`/api/articles/${slug}`).subscribe({
      next: (data) => {
        this.article = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
