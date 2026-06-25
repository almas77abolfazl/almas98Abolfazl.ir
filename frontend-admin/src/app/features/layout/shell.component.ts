import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  template: `
    @if (error$ | async; as error) {
      <div class="fixed top-0 left-64 right-0 bg-red-600 text-white px-6 py-3 shadow-lg z-50 flex justify-between items-center">
        <span class="font-medium">{{ error }}</span>
        <button (click)="clearError()" class="ml-4 text-white hover:text-gray-200 text-xl font-bold leading-none">&times;</button>
      </div>
    }
    <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside class="w-64 bg-gray-800 dark:bg-gray-950 text-white flex flex-col">
        <div class="p-4 border-b border-gray-700">
          <h1 class="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav class="flex-1 p-4 space-y-1">
          <a routerLink="/dashboard" routerLinkActive="bg-gray-700 dark:bg-gray-800" class="block px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-800">Dashboard</a>
          <a routerLink="/about-me" routerLinkActive="bg-gray-700 dark:bg-gray-800" class="block px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-800">About Me</a>
          <a routerLink="/experiences" routerLinkActive="bg-gray-700 dark:bg-gray-800" class="block px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-800">Experiences</a>
          <a routerLink="/educations" routerLinkActive="bg-gray-700 dark:bg-gray-800" class="block px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-800">Educations</a>
          <a routerLink="/skills" routerLinkActive="bg-gray-700 dark:bg-gray-800" class="block px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-800">Skills</a>
          <a routerLink="/articles" routerLinkActive="bg-gray-700 dark:bg-gray-800" class="block px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-800">Articles</a>
          <a routerLink="/testimonials" routerLinkActive="bg-gray-700 dark:bg-gray-800" class="block px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-800">Testimonials</a>
          <a routerLink="/messages" routerLinkActive="bg-gray-700 dark:bg-gray-800" class="block px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-800">Messages</a>
        </nav>
        <div class="p-4 border-t border-gray-700">
          <button (click)="logout()" class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded">Logout</button>
        </div>
      </aside>
      <main class="flex-1 overflow-auto p-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [],
})
export class ShellComponent {
  constructor(private authService: AuthService, private notificationService: NotificationService) {}

  get error$() {
    return this.notificationService.error$;
  }

  logout(): void {
    this.authService.logout();
  }

  clearError(): void {
    this.notificationService.clear();
  }
}
