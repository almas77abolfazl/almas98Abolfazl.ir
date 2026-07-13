import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';
import { AboutMe, Experience, Skill, Testimonial } from '../../shared/services/api.service';
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
  testimonials: Testimonial[] = [];
  isLoading = true;
  contact = { name: '', email: '', subject: '', message: '' };
  success = false;
  error = '';
  newTestimonial = { authorName: '', companyRole: '', content: '', authorImageUrl: '', rating: 0 };
  testimonialSuccess = false;
  testimonialError = '';

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
    this.api.getTestimonials().subscribe(data => this.testimonials = data);
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

  submitTestimonial(): void {
    this.testimonialError = '';
    this.testimonialSuccess = false;
    const payload: any = {
      authorName: this.newTestimonial.authorName,
      companyRole: this.newTestimonial.companyRole || undefined,
      content: this.newTestimonial.content,
    };
    if (this.newTestimonial.rating > 0) {
      payload.rating = this.newTestimonial.rating;
    }
    if (this.newTestimonial.authorImageUrl.trim()) {
      payload.authorImageUrl = this.newTestimonial.authorImageUrl.trim();
    }
    this.api.postTestimonial(payload).subscribe({
      next: () => {
        this.testimonialSuccess = true;
        this.newTestimonial = { authorName: '', companyRole: '', content: '', authorImageUrl: '', rating: 0 };
      },
      error: () => {
        this.testimonialError = this.i18n.isFa ? 'خطا در ارسال نظر' : 'Failed to submit testimonial';
      }
    });
  }

  setRating(value: number): void {
    this.newTestimonial.rating = value;
  }

  testimonialInitial(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase();
  }
}
