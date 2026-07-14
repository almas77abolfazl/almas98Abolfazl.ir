import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { ThemeService } from '../../services/theme.service';
import { ApiService } from '../../services/api.service';
import { SiteSettingsService } from '../../services/site-settings.service';
import { SITE_URL } from '../../site-config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  menuOpen = signal(false);
  resumeUrl = signal<string | undefined>(undefined);

  constructor(
    public i18n: I18nService,
    public theme: ThemeService,
    private api: ApiService,
    public siteSettings: SiteSettingsService,
  ) {}

  ngOnInit(): void {
    this.api.getAboutMe().subscribe({
      next: (data) => this.resumeUrl.set(data.resumeUrl || undefined),
      error: () => {},
    });
  }

  get resumeHref(): string | undefined {
    const url = this.resumeUrl();
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    return url.startsWith('/') ? `${SITE_URL}${url}` : `${SITE_URL}/${url}`;
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
