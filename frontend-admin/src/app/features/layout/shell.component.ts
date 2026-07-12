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
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, ToastContainerComponent, ConfirmDialogComponent],
  template: `
    @if (error$ | async; as error) {
      <div class="fixed top-0 inset-x-0 bg-rose-600 px-6 py-3 text-white shadow-lg z-[60] flex justify-between items-center">
        <span class="font-medium">{{ error }}</span>
        <button (click)="clearError()" class="ms-4 text-white hover:text-rose-100 text-xl font-bold leading-none">&times;</button>
      </div>
    }

    <div class="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">

      <!-- Desktop sidebar -->
      <aside class="hidden lg:flex w-64 shrink-0 flex-col border-s-0 border-e border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div class="flex h-16 items-center gap-2 border-b border-slate-200 px-5 dark:border-slate-800">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-400 text-sm font-bold text-white">A</div>
          <span class="text-base font-semibold text-slate-800 dark:text-slate-100">{{ i18n.t('appName') }}</span>
        </div>

        <nav class="flex-1 space-y-1 overflow-y-auto p-3">
          @for (item of nav; track item.path) {
            <a [routerLink]="item.path"
              routerLinkActive="admin-nav-link-active"
              #r="routerLinkActive"
              [class]="'admin-nav-link' + (r.isActive ? ' admin-nav-link-active' : '')">
              <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" />
              </svg>
              <span>{{ i18n.t(item.key) }}</span>
            </a>
          }
        </nav>

        <div class="border-t border-slate-200 p-3 dark:border-slate-800">
          <div class="mb-2 flex items-center gap-3 px-2">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">A</div>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-slate-700 dark:text-slate-200">Admin</p>
              <p class="truncate text-xs text-slate-400 dark:text-slate-500">almas98</p>
            </div>
          </div>
          <button (click)="logout()" class="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-rose-400">
            {{ i18n.t('logout') }}
          </button>
        </div>
      </aside>

      <!-- Mobile sidebar drawer -->
      @if (menuOpen()) {
        <div class="fixed inset-0 z-50 lg:hidden" (click)="closeMenu()">
          <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
        </div>
      }
      <aside
        class="fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-slate-200 bg-white transition-transform duration-300 lg:hidden dark:border-slate-800 dark:bg-slate-900"
        [class.translate-x-full]="!menuOpen()"
        [class.translate-x-0]="menuOpen()">
        <div class="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-400 text-sm font-bold text-white">A</div>
            <span class="text-base font-semibold text-slate-800 dark:text-slate-100">{{ i18n.t('appName') }}</span>
          </div>
          <button (click)="closeMenu()" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" [attr.aria-label]="i18n.t('close')">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav class="flex-1 space-y-1 overflow-y-auto p-3">
          @for (item of nav; track item.path) {
            <a [routerLink]="item.path" (click)="closeMenu()"
              routerLinkActive="admin-nav-link-active"
              #r="routerLinkActive"
              [class]="'admin-nav-link' + (r.isActive ? ' admin-nav-link-active' : '')">
              <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" />
              </svg>
              <span>{{ i18n.t(item.key) }}</span>
            </a>
          }
        </nav>

        <div class="border-t border-slate-200 p-3 dark:border-slate-800">
          <button (click)="logout(); closeMenu()" class="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-rose-400">
            {{ i18n.t('logout') }}
          </button>
        </div>
      </aside>

      <!-- Main -->
      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/80">
          <button (click)="toggleMenu()" class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800" [attr.aria-label]="i18n.t('menu')">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-100 lg:hidden">{{ i18n.t('appName') }}</h1>
          <div class="flex items-center gap-2">
            <button (click)="i18n.toggleLang()" type="button"
              class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              [title]="i18n.t('toggleLang')">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.6 9h16.8M3.6 15h16.8" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
              </svg>
            </button>
            <button (click)="theme.toggle()" type="button"
              class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              [title]="theme.isDark() ? i18n.t('themeLight') : i18n.t('themeDark')">
              @if (!theme.isDark()) {
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              } @else {
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            </button>
          </div>
        </header>

        <main class="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <router-outlet></router-outlet>
        </main>
      </div>

      <app-toast-container></app-toast-container>
      <app-confirm-dialog></app-confirm-dialog>
    </div>
  `,
  styles: [],
})
export class ShellComponent {
  menuOpen = signal(false);

  nav: NavItem[] = [
    { path: '/dashboard', key: 'nav_dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/about-me', key: 'nav_about', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { path: '/experiences', key: 'nav_experiences', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { path: '/educations', key: 'nav_educations', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
    { path: '/skills', key: 'nav_skills', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { path: '/articles', key: 'nav_articles', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V6a2 2 0 00-2-2z' },
    { path: '/videos', key: 'nav_videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { path: '/testimonials', key: 'nav_testimonials', icon: 'M8 10H5a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2zm0 0h2a2 2 0 002-2v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2a2 2 0 002 2zm0 0v6a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2H8z' },
    { path: '/messages', key: 'nav_messages', icon: 'M8 10H5a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2zm0 0h2a2 2 0 002-2v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2a2 2 0 002 2zm0 0v6a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2H8z' },
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

  clearError(): void {
    this.notificationService.clear();
  }
}
