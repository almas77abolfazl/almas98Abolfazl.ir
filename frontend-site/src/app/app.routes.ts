import { Routes } from '@angular/router';

// Every feature is lazy-loaded so third-party libs they pull in (e.g. `marked` used by the
// article/project detail pages) are split into their own chunks and never
// downloaded on the initial home navigation. Home is also lazy-loaded for smaller initial chunk.
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'about-me', loadComponent: () => import('./features/about-me/about-me.component').then(m => m.AboutMeComponent) },
  { path: 'experiences', redirectTo: 'about-me', pathMatch: 'full' },
  { path: 'skills', redirectTo: 'about-me', pathMatch: 'full' },
  { path: 'blog', loadComponent: () => import('./features/blog/blog.component').then(m => m.BlogComponent) },
  { path: 'blog/:slug', loadComponent: () => import('./features/article-detail/article-detail.component').then(m => m.ArticleDetailComponent) },
  { path: 'videos', loadComponent: () => import('./features/videos/videos.component').then(m => m.VideosComponent) },
  { path: 'projects', loadComponent: () => import('./features/projects/projects.component').then(m => m.ProjectsComponent) },
  { path: 'projects/:id', loadComponent: () => import('./features/project-detail/project-detail.component').then(m => m.ProjectDetailComponent) },
  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
