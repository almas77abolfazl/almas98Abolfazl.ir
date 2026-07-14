import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { AdminI18nService } from '../../core/services/admin-i18n.service';
import { ToastContainerComponent } from '../../core/components/toast-container.component';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog.component';
import { AsyncPipe } from '@angular/common';

interface NavItem {
  path: string;
  key: string; // i18n key
  icon: string; // inline SVG path data
  group?: string; // i18n key for the section label
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './shell.component.html',
  styles: [],
})
export class ShellComponent {
  menuOpen = signal(false);

  nav: NavItem[] = [
    { path: '/dashboard', key: 'nav_dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/about-me', key: 'nav_about', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', group: 'nav_group_content' },
    { path: '/experiences', key: 'nav_experiences', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', group: 'nav_group_content' },
    { path: '/educations', key: 'nav_educations', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z', group: 'nav_group_content' },
    { path: '/skills', key: 'nav_skills', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', group: 'nav_group_content' },
    { path: '/skill-categories', key: 'nav_skill_categories', icon: 'M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z', group: 'nav_group_content' },
    { path: '/projects', key: 'nav_projects', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z', group: 'nav_group_content' },
    { path: '/articles', key: 'nav_articles', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V6a2 2 0 00-2-2z', group: 'nav_group_content' },
    { path: '/videos', key: 'nav_videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', group: 'nav_group_content' },
    { path: '/testimonials', key: 'nav_testimonials', icon: 'M8 10H5a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2zm0 0h2a2 2 0 002-2v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2a2 2 0 002 2zm0 0v6a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2H8z', group: 'nav_group_engagement' },
    { path: '/messages', key: 'nav_messages', icon: 'M8 10H5a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2zm0 0h2a2 2 0 002-2v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2a2 2 0 002 2zm0 0v6a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2H8z', group: 'nav_group_engagement' },
    { path: '/settings', key: 'nav_settings', icon: 'M10.325 1.95a1 1 0 011.35 0l.158.158a1 1 0 001.342.05l.21-.158a1 1 0 011.415.018l1.414 1.414a1 1 0 01.018 1.415l-.158.21a1 1 0 00.05 1.342l.158.158a1 1 0 010 1.35l-.158.158a1 1 0 00-.05 1.342l.158.21a1 1 0 01-.018 1.415l-1.414 1.414a1 1 0 01-1.415.018l-.21-.158a1 1 0 00-1.342.05l-.158.158a1 1 0 01-1.35 0l-.158-.158a1 1 0 00-1.342-.05l-.21.158a1 1 0 01-1.415-.018l-1.414-1.414a1 1 0 01-.018-1.415l.158-.21a1 1 0 00-.05-1.342l-.158-.158a1 1 0 010-1.35l.158-.158a1 1 0 00.05-1.342l-.158-.21a1 1 0 01.018-1.415l1.414-1.414a1 1 0 011.415-.018l.21.158a1 1 0 001.342-.05l.158-.158z M12 15a3 3 0 100-6 3 3 0 000 6z', group: 'nav_group_system' },
  ];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    public theme: ThemeService,
    public i18n: AdminI18nService,
  ) {}

  get error$() {
    return this.notificationService.error$;
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }

  groupDot(group?: string): string {
    switch (group) {
      case 'nav_group_content': return 'bg-indigo-400';
      case 'nav_group_engagement': return 'bg-emerald-400';
      case 'nav_group_system': return 'bg-amber-400';
      default: return 'bg-slate-400';
    }
  }

  clearError(): void {
    this.notificationService.clear();
  }
}
