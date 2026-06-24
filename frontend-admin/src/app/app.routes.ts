import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [AdminGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'admin/about-me', loadComponent: () => import('./features/about-me/about-me.component').then(m => m.AboutMeComponent) },
      { path: 'admin/experiences', loadComponent: () => import('./features/experiences/experiences.component').then(m => m.ExperiencesComponent) },
      { path: 'admin/educations', loadComponent: () => import('./features/educations/educations.component').then(m => m.EducationsComponent) },
      { path: 'admin/skills', loadComponent: () => import('./features/skills/skills.component').then(m => m.SkillsComponent) },
      { path: 'admin/articles', loadComponent: () => import('./features/articles/articles.component').then(m => m.ArticlesComponent) },
      { path: 'admin/testimonials', loadComponent: () => import('./features/testimonials/testimonials.component').then(m => m.TestimonialsComponent) },
      { path: 'admin/messages', loadComponent: () => import('./features/contact-messages/contact-messages.component').then(m => m.ContactMessagesComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
