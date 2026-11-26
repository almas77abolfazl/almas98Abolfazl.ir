import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './shared/services/api.service';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const articles = await firstValueFrom(inject(ApiService).getArticles());
      return articles.map(({ slug }) => ({ slug }));
    },
  },
  {
    path: 'fa/blog/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const articles = await firstValueFrom(inject(ApiService).getArticles());
      return articles.map(({ slug }) => ({ slug }));
    },
  },
  {
    path: 'experiences',
    renderMode: RenderMode.Client,
  },
  {
    path: 'fa/experiences',
    renderMode: RenderMode.Client,
  },
  {
    path: 'skills',
    renderMode: RenderMode.Client,
  },
  {
    path: 'fa/skills',
    renderMode: RenderMode.Client,
  },
  {
    path: 'projects/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const projects = await firstValueFrom(inject(ApiService).getProjects());
      return projects.map(({ id }) => ({ id }));
    },
  },
  {
    path: 'fa/projects/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const projects = await firstValueFrom(inject(ApiService).getProjects());
      return projects.map(({ id }) => ({ id }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
