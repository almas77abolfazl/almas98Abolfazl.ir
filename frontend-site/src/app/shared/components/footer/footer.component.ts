import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../services/i18n.service';
import { ApiService, AboutMe } from '../../services/api.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  aboutMe?: AboutMe;

  constructor(public i18n: I18nService, private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAboutMe().subscribe(data => this.aboutMe = data);
  }

  get socials(): { key: string; url: string; label: string }[] {
    if (!this.aboutMe) return [];
    const map: [keyof AboutMe, string][] = [
      ['linkedinUrl', 'LinkedIn'],
      ['githubUrl', 'GitHub'],
      ['youtubeUrl', 'YouTube'],
      ['twitterUrl', 'X'],
      ['instagramUrl', 'Instagram'],
    ];
    return map
      .filter(([k]) => !!this.aboutMe?.[k])
      .map(([k, label]) => ({ key: k as string, url: this.aboutMe![k] as string, label }));
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }
}
