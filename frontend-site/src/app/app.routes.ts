import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AboutMeComponent } from './features/about-me/about-me.component';
import { BlogComponent } from './features/blog/blog.component';
import { ArticleDetailComponent } from './features/article-detail/article-detail.component';
import { VideosComponent } from './features/videos/videos.component';
import { ProjectsComponent } from './features/projects/projects.component';
import { ProjectDetailComponent } from './features/project-detail/project-detail.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about-me', component: AboutMeComponent },
  { path: 'experiences', redirectTo: 'about-me', pathMatch: 'full' },
  { path: 'skills', redirectTo: 'about-me', pathMatch: 'full' },
  { path: 'blog', component: BlogComponent },
  { path: 'blog/:slug', component: ArticleDetailComponent },
  { path: 'videos', component: VideosComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'projects/:id', component: ProjectDetailComponent },
  { path: '**', component: NotFoundComponent }
];
