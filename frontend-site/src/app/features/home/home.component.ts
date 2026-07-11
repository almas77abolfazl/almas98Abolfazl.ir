import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';
import { AboutMe, Experience, Skill } from '../../shared/services/api.service';
import { SITE_URL, AUTHOR_NAME, SOCIAL_LINKS } from '../../shared/site-config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  aboutMe?: AboutMe;
  experiences: Experience[] = [];
  skills: Skill[] = [];
  isLoading = true;
  contact = { name: '', email: '', subject: '', message: '' };
  success = false;
  error = '';

  constructor(
    public i18n: I18nService,
    private api: ApiService,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.seo.update({
      title: AUTHOR_NAME,
      description: this.i18n.t('seoHomeDesc'),
      path: '/',
      type: 'profile',
    });

    this.api.getAboutMe().subscribe(data => {
      this.aboutMe = data;
      this.applyPersonJsonLd(data);
    });
    this.api.getExperiences().subscribe(data => this.experiences = data);
    this.api.getSkills().subscribe(data => this.skills = data);
  }

  private applyPersonJsonLd(aboutMe?: AboutMe): void {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    };
    if (aboutMe?.title) {
      schema['jobTitle'] = aboutMe.title;
    }
    if (aboutMe?.avatarUrl) {
      schema['image'] = aboutMe.avatarUrl;
    }
    if (SOCIAL_LINKS.length) {
      schema['sameAs'] = SOCIAL_LINKS;
    }
    this.seo.setJsonLd(schema);
  }

  get latestExperience(): Experience | undefined {
    return this.experiences[0];
  }

  get topSkills(): Skill[] {
    return this.skills.slice(0, 6);
  }

  onSubmit(): void {
    this.error = '';
    this.success = false;
    this.api.postContactMessage(this.contact).subscribe({
      next: () => {
        this.success = true;
        this.contact = { name: '', email: '', subject: '', message: '' };
      },
      error: () => {
        this.error = this.i18n.isFa ? 'خطا در ارسال پیام' : 'Failed to send message';
      }
    });
  }
}
