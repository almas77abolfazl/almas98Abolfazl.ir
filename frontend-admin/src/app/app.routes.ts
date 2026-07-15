import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { AdminGuard } from './core/guards/admin.guard';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [AdminGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'about-me', loadComponent: () => import('./features/about-me/about-me.component').then(m => m.AboutMeComponent), canDeactivate: [pendingChangesGuard] },
      { path: 'experiences', loadComponent: () => import('./features/experiences/experiences.component').then(m => m.ExperiencesComponent), canDeactivate: [pendingChangesGuard] },
      { path: 'educations', loadComponent: () => import('./features/educations/educations.component').then(m => m.EducationsComponent), canDeactivate: [pendingChangesGuard] },
      { path: 'skills', loadComponent: () => import('./features/skills/skills.component').then(m => m.SkillsComponent), canDeactivate: [pendingChangesGuard] },
      { path: 'skill-categories', loadComponent: () => import('./features/skill-categories/skill-categories.component').then(m => m.SkillCategoriesComponent), canDeactivate: [pendingChangesGuard] },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'articles', loadComponent: () => import('./features/articles/articles.component').then(m => m.ArticlesComponent), canDeactivate: [pendingChangesGuard] },
      { path: 'reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'videos', loadComponent: () => import('./features/videos/videos.component').then(m => m.VideosComponent), canDeactivate: [pendingChangesGuard] },
      { path: 'projects', loadComponent: () => import('./features/projects/projects.component').then(m => m.ProjectsComponent), canDeactivate: [pendingChangesGuard] },
      { path: 'testimonials', loadComponent: () => import('./features/testimonials/testimonials.component').then(m => m.TestimonialsComponent) },
      { path: 'messages', loadComponent: () => import('./features/contact-messages/contact-messages.component').then(m => m.ContactMessagesComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
