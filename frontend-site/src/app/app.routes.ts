import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

// Home is the LCP entry route, so it stays eager. Every other feature is
// lazy-loaded so third-party libs they pull in (e.g. `marked` used by the
// article/project detail pages) are split into their own chunks and never
// downloaded on the initial home navigation.
export const routes: Routes = [
  { path: '', component: HomeComponent },
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
