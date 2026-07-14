import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminI18nService } from '../../../core/services/admin-i18n.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styles: [],
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private router: Router, public i18n: AdminI18nService) {}

  toggleLang(): void {
    this.i18n.toggleLang();
  }

  /**
   * Link back to the public site. In development the admin panel and the public
   * site are separate dev servers (admin on :4201, site on :4200); in production
   * they share a domain so the site root is `/`.
   */
  get siteUrl(): string {
    const { protocol, hostname, port } = window.location;
    if (port === '4201') {
      return `${protocol}//${hostname}:4200`;
    }
    if (port) {
      return `${protocol}//${hostname}:${Number(port) - 1}`;
    }
    return '/';
  }

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
