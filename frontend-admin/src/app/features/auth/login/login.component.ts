import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminI18nService } from '../../../core/services/admin-i18n.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div class="w-full max-w-md admin-card">
        <div class="mb-6 flex items-center justify-center gap-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-400 text-base font-bold text-white">A</div>
          <h1 class="text-xl font-bold text-slate-800 dark:text-slate-100">{{ i18n.t('login_title') }}</h1>
        </div>
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-4">
          <div>
            <label for="username" class="admin-field-label">{{ i18n.t('username') }}</label>
            <input
              type="text"
              id="username"
              name="username"
              [(ngModel)]="username"
              required
              class="admin-input"
            />
          </div>
          <div>
            <label for="password" class="admin-field-label">{{ i18n.t('password') }}</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              class="admin-input"
            />
          </div>
          @if (error) {
            <div class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{{ error }}</div>
          }
          <button
            type="submit"
            [disabled]="loading"
            class="admin-btn admin-btn-primary w-full"
          >
            {{ loading ? i18n.t('signingIn') : i18n.t('signIn') }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private router: Router, public i18n: AdminI18nService) {}

  onSubmit() {
    this.loading = true;
    this.error = '';

    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: this.username, password: this.password }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => { throw new Error(err.message || 'Login failed'); });
        }
        return res.json();
      })
      .then((data) => {
        localStorage.setItem('token', data.access_token);
        this.router.navigate(['/dashboard']);
      })
      .catch((err) => {
        this.error = err.message || 'An error occurred';
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
