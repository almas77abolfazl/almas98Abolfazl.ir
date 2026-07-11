import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';
import { AboutMe } from '../../shared/services/api.service';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss'
})
export class AboutMeComponent implements OnInit {
  aboutMe?: AboutMe;
  isLoading = true;

  constructor(
    public i18n: I18nService,
    private api: ApiService,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.seo.update({
      title: this.i18n.t('aboutMeTitle'),
      description: this.i18n.t('seoAboutDesc'),
      path: '/about-me',
    });

    this.api.getAboutMe().subscribe({
      next: data => {
        this.aboutMe = data;
        const bio = this.i18n.isFa ? (data.bioFa || data.bio) : data.bio;
        if (bio) {
          this.seo.update({
            title: this.i18n.t('aboutMeTitle'),
            description: bio,
            path: '/about-me',
          });
        }
      },
      complete: () => this.isLoading = false
    });
  }
}
