import { Component, OnInit, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';
import { SiteSettingsService } from '../../shared/services/site-settings.service';
import { AboutMe, Experience, Skill, Testimonial } from '../../shared/services/api.service';
import { SITE_URL, AUTHOR_NAME } from '../../shared/site-config';

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
  newTestimonial = { authorName: '', companyRole: '', email: '', content: '', authorImageUrl: '' };
  testimonialSuccess = false;
  testimonialError = '';
  uploadingImage = false;
  selectedTestimonial = signal<Testimonial | null>(null);

  constructor(
    public i18n: I18nService,
    private api: ApiService,
    private seo: SeoService,
    public siteSettings: SiteSettingsService
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
    const socials = aboutMe
      ? [aboutMe.linkedinUrl, aboutMe.githubUrl, aboutMe.youtubeUrl, aboutMe.twitterUrl, aboutMe.instagramUrl]
          .filter((u): u is string => !!u)
      : [];
    if (socials.length) {
      schema['sameAs'] = socials;
    }
    this.seo.setJsonLd(schema);
  }

  get latestExperience(): Experience | undefined {
    return this.experiences[0];
  }

  get resumeHref(): string | undefined {
    const url = this.aboutMe?.resumeUrl;
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    return url.startsWith('/') ? `${SITE_URL}${url}` : `${SITE_URL}/${url}`;
  }

  get topSkills(): Skill[] {
    return this.skills.slice(0, 6);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  submitTestimonial(): void {
    this.testimonialError = '';
    this.testimonialSuccess = false;
    const name = this.newTestimonial.authorName.trim();
    const role = this.newTestimonial.companyRole.trim();
    const content = this.newTestimonial.content.trim();
    const email = this.newTestimonial.email.trim();
    if (!name || !content) {
      this.testimonialError = this.i18n.isFa ? 'نام و پیام الزامی است' : 'Name and message are required';
      return;
    }
    if (!this.isValidEmail(email)) {
      this.testimonialError = this.i18n.isFa ? 'یک ایمیل معتبر وارد کنید' : 'Please enter a valid email';
      return;
    }
    const payload: any = {
      authorName: name,
      authorNameFa: name,
      companyRole: role || undefined,
      companyRoleFa: role || undefined,
      email: email,
      content: content,
      contentFa: content,
    };
    if (this.newTestimonial.authorImageUrl.trim()) {
      payload.authorImageUrl = this.newTestimonial.authorImageUrl.trim();
    }
    this.api.postTestimonial(payload).subscribe({
      next: () => {
        this.testimonialSuccess = true;
        this.newTestimonial = { authorName: '', companyRole: '', email: '', content: '', authorImageUrl: '' };
      },
      error: () => {
        this.testimonialError = this.i18n.isFa ? 'خطا در ارسال نظر' : 'Failed to submit testimonial';
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.uploadImage(file);
    }
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.uploadImage(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private uploadImage(file: File): void {
    this.testimonialError = '';
    this.uploadingImage = true;
    this.api.uploadTestimonialImage(file).subscribe({
      next: (res) => {
        this.uploadingImage = false;
        this.newTestimonial.authorImageUrl = res.url;
      },
      error: () => {
        this.uploadingImage = false;
        this.testimonialError = this.i18n.isFa ? 'بارگذاری عکس ناموفق بود' : 'Image upload failed';
      },
    });
  }

  removeImage(): void {
    this.newTestimonial.authorImageUrl = '';
  }

  testimonialInitial(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  isLong(t: Testimonial): boolean {
    const text = this.i18n.isFa ? (t.contentFa || t.content) : t.content;
    return (text || '').length > 120;
  }

  private testiDown = false;
  private testiDragged = false;
  private testiStartX = 0;
  private testiStartScroll = 0;

  onTestiDown(e: MouseEvent, el: HTMLElement): void {
    this.testiDown = true;
    this.testiDragged = false;
    this.testiStartX = e.pageX;
    this.testiStartScroll = el.scrollLeft;
  }

  onTestiMove(e: MouseEvent, el: HTMLElement): void {
    if (!this.testiDown) return;
    const walk = e.pageX - this.testiStartX;
    if (Math.abs(walk) > 5) this.testiDragged = true;
    el.scrollLeft = this.testiStartScroll - walk;
  }

  onTestiUp(el: HTMLElement): void {
    this.testiDown = false;
  }

  scrollTestimonials(el: HTMLElement, dir: number): void {
    el.scrollBy({ left: dir * 340, behavior: 'smooth' });
  }

  openTestimonial(t: Testimonial): void {
    if (this.testiDragged) {
      this.testiDragged = false;
      return;
    }
    this.selectedTestimonial.set(t);
    document.body.classList.add('overflow-hidden');
  }

  closeTestimonial(): void {
    this.selectedTestimonial.set(null);
    document.body.classList.remove('overflow-hidden');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedTestimonial()) {
      this.closeTestimonial();
    }
  }
}
