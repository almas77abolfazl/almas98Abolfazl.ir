import { Component, OnInit, signal } from '@angular/core';
import { I18nService } from '../../services/i18n.service';
import { ApiService, AboutMe } from '../../services/api.service';
import { SiteConfigService } from '../../services/site-config.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  aboutMe = signal<AboutMe | undefined>(undefined);

  constructor(public i18n: I18nService, private api: ApiService, public config: SiteConfigService) {}

  ngOnInit(): void {
    this.api.getAboutMe().subscribe(data => this.aboutMe.set(data));
  }

  get socials(): { key: string; url: string; label: string }[] {
    const about = this.aboutMe();
    if (!about) return [];
    const map: [keyof AboutMe, string][] = [
      ['linkedinUrl', 'LinkedIn'],
      ['githubUrl', 'GitHub'],
      ['youtubeUrl', 'YouTube'],
      ['twitterUrl', 'X'],
      ['instagramUrl', 'Instagram'],
    ];
    return map
      .filter(([k]) => !!about[k])
      .map(([k, label]) => ({ key: k as string, url: about[k] as string, label }));
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }
}
