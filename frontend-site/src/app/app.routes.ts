import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AboutMeComponent } from './features/about-me/about-me.component';
import { ExperiencesComponent } from './features/experiences/experiences.component';
import { SkillsComponent } from './features/skills/skills.component';
import { BlogComponent } from './features/blog/blog.component';
import { ArticleDetailComponent } from './features/article-detail/article-detail.component';
import { VideosComponent } from './features/videos/videos.component';
import { ProjectsComponent } from './features/projects/projects.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about-me', component: AboutMeComponent },
  { path: 'experiences', component: ExperiencesComponent },
  { path: 'skills', component: SkillsComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'blog/:slug', component: ArticleDetailComponent },
  { path: 'videos', component: VideosComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: '**', component: NotFoundComponent }
];
