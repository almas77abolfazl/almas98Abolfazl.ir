import { Component, OnInit, HostListener, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';
import { SiteSettingsService } from '../../shared/services/site-settings.service';
import { AboutMe, Experience, Skill, Testimonial } from '../../shared/services/api.service';
import { SiteConfigService } from '../../shared/services/site-config.service';
import { LazyInitDirective } from '../../shared/directives/lazy-init.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LazyInitDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  aboutMe = signal<AboutMe | undefined>(undefined);
  experiences = signal<Experience[]>([]);
  skills = signal<Skill[]>([]);
  testimonials = signal<Testimonial[]>([]);
  isLoading = signal(true);
  isLoadingExperiences = signal(false);
  isLoadingSkills = signal(false);
  isLoadingTestimonials = signal(false);
  newTestimonial = { authorName: '', companyRole: '', email: '', content: '', authorImageUrl: '' };
  testimonialImageUrl = signal('');
  testimonialSuccess = signal(false);
  testimonialError = signal('');
  uploadingImage = signal(false);
  selectedTestimonial = signal<Testimonial | null>(null);

  constructor(
    public i18n: I18nService,
    private api: ApiService,
    private seo: SeoService,
    public siteSettings: SiteSettingsService,
    private config: SiteConfigService,
  ) {}

  ngOnInit(): void {
    this.seo.update({
      title: this.config.siteName(),
      description: this.i18n.t('seoHomeDesc'),
      path: '/',
      type: 'profile',
    });

    this.api.getAboutMe().subscribe(data => {
      this.aboutMe.set(data);
      this.seo.setTitle(this.config.siteName());
      this.applyPersonJsonLd(data);
    });
  }

  loadExperiences(): void {
    if (this.experiences().length === 0) {
      this.isLoadingExperiences.set(true);
      this.api.getExperiences().subscribe({
        next: (data) => {
          this.experiences.set(data);
          this.isLoadingExperiences.set(false);
        },
        error: () => {
          this.isLoadingExperiences.set(false);
        }
      });
    }
  }

  loadSkills(): void {
    if (this.skills().length === 0) {
      this.isLoadingSkills.set(true);
      this.api.getSkills().subscribe({
        next: (data) => {
          this.skills.set(data);
          this.isLoadingSkills.set(false);
        },
        error: () => {
          this.isLoadingSkills.set(false);
        }
      });
    }
  }

  loadTestimonials(): void {
    if (this.testimonials().length === 0) {
      this.isLoadingTestimonials.set(true);
      this.api.getTestimonials().subscribe({
        next: (data) => {
          this.testimonials.set(data);
          this.isLoadingTestimonials.set(false);
        },
        error: () => {
          this.isLoadingTestimonials.set(false);
        }
      });
    }
  }

  private applyPersonJsonLd(aboutMe?: AboutMe): void {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${this.config.siteUrl()}/#person`,
      name: this.config.siteNameEn(),
      alternateName: this.config.siteNameFa() || undefined,
      url: this.config.siteUrl(),
    };
    if (aboutMe?.title) {
      schema['jobTitle'] = aboutMe.title;
    }
    schema['image'] = this.config.resolveImage(aboutMe?.avatarUrl);
    const socials = aboutMe
      ? [...new Set(
          [aboutMe.linkedinUrl, aboutMe.githubUrl, aboutMe.youtubeUrl, aboutMe.twitterUrl, aboutMe.instagramUrl]
            .filter((u): u is string => !!u),
        )]
      : [];
    if (socials.length) {
      schema['sameAs'] = socials;
    }
    this.seo.setJsonLd(schema);
  }

  get latestExperience(): Experience | undefined {
    return this.experiences()[0];
  }

  get resumeHref(): string | undefined {
    const url = this.aboutMe()?.resumeUrl;
    if (!url) return undefined;
    return this.config.assetUrl(url);
  }

  get topSkills(): Skill[] {
    return this.skills().slice(0, 6);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  submitTestimonial(): void {
    this.testimonialError.set('');
    this.testimonialSuccess.set(false);
    const name = this.newTestimonial.authorName.trim();
    const role = this.newTestimonial.companyRole.trim();
    const content = this.newTestimonial.content.trim();
    const email = this.newTestimonial.email.trim();
    if (!name || !content) {
      this.testimonialError.set(this.i18n.isFa ? 'نام و پیام الزامی است' : 'Name and message are required');
      return;
    }
    if (!this.isValidEmail(email)) {
      this.testimonialError.set(this.i18n.isFa ? 'یک ایمیل معتبر وارد کنید' : 'Please enter a valid email');
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
    if (this.testimonialImageUrl().trim()) {
      payload.authorImageUrl = this.testimonialImageUrl().trim();
    }
    this.api.postTestimonial(payload).subscribe({
      next: () => {
        this.testimonialSuccess.set(true);
        this.newTestimonial = { authorName: '', companyRole: '', email: '', content: '', authorImageUrl: '' };
        this.testimonialImageUrl.set('');
      },
      error: () => {
        this.testimonialError.set(this.i18n.isFa ? 'خطا در ارسال نظر' : 'Failed to submit testimonial');
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
    this.testimonialError.set('');
    this.uploadingImage.set(true);
    this.api.uploadTestimonialImage(file).subscribe({
      next: (res) => {
        this.uploadingImage.set(false);
        this.testimonialImageUrl.set(res.url);
      },
      error: () => {
        this.uploadingImage.set(false);
        this.testimonialError.set(this.i18n.isFa ? 'بارگذاری عکس ناموفق بود' : 'Image upload failed');
      },
    });
  }

  removeImage(): void {
    this.testimonialImageUrl.set('');
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
    if (!this.isBrowser) {
      return;
    }
    if (this.testiDragged) {
      this.testiDragged = false;
      return;
    }
    this.selectedTestimonial.set(t);
    document.body.classList.add('overflow-hidden');
  }

  closeTestimonial(): void {
    if (!this.isBrowser) {
      return;
    }
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
