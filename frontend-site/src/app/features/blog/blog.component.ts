import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-blog',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-8">Blog</h1>
      <div *ngIf="loading" class="text-gray-500 dark:text-gray-400">Loading...</div>
      <div *ngIf="!loading && articles.length === 0" class="text-gray-500 dark:text-gray-400">No articles yet.</div>
      <div class="space-y-6">
        <a *ngFor="let article of articles" [routerLink]="['/blog', article.slug]" class="block bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition">
          <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-2">{{ article.title }}</h2>
          <p *ngIf="article.excerpt" class="text-gray-600 dark:text-gray-300 mb-3">{{ article.excerpt }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ article.publishedAt | date:'mediumDate' }}</p>
        </a>
      </div>
    </div>
  `,
  styles: [],
})
export class BlogComponent implements OnInit {
  articles: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/articles').subscribe({
      next: (data) => {
        this.articles = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
