import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { filter } from 'rxjs';

export type Language = 'en' | 'fa';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    home: 'Home',
    about: 'About Me',
    experiences: 'Experiences',
    skills: 'Skills',
    articles: 'Articles',
    videos: 'Videos',
    projects: 'Projects',
    contact: 'Contact',
    toggleTheme: 'Toggle theme',
    toggleLang: 'Toggle language',
    menu: 'Menu',
    close: 'Close',
    readMore: 'Read more',
    years: 'years',
    present: 'Present',
    aboutMeTitle: 'About Me',
    experiencesTitle: 'Work Experiences',
    skillsTitle: 'Skills',
    categoryTitle: 'Other Skills',
    educationTitle: 'Education',
    minRead: 'min read',
    likes: 'likes',
  like: 'Like',
  liked: 'Liked',
  unlike: 'Unlike',
  noArticles: 'No articles yet',
  articleNotFound: 'Article not found',
    backToBlog: 'Back to Blog',
    backToProjects: 'Back to Projects',
    tableOfContents: 'Table of Contents',
  goBack: 'Go back',
    writing: 'Writing',
    notFoundTitle: 'Page not found',
    notFoundMessage: "The page you're looking for doesn't exist or has been moved.",
    backToHome: 'Back to home',
    downloadResume: 'Resume',
    videosTitle: 'Videos',
    videosSubtitle: 'Watch',
    noVideos: 'No videos yet',
    playVideo: 'Play video',
    projectsTitle: 'Projects',
    projectsSubtitle: 'Selected work',
    noProjects: 'No projects yet',
    projectLive: 'Live demo',
    projectCode: 'Source code',
    seoHomeDesc: 'Personal portfolio of {name} — full-stack developer. Explore my experiences, skills, articles and videos.',
    seoAboutDesc: 'Learn more about {name} — background, biography and professional focus.',
    seoExperiencesDesc: 'Work experience and professional history of {name}.',
    seoSkillsDesc: 'Technical skills and technologies used by {name}.',
    seoBlogDesc: 'Articles and writing by {name} on software development and technology.',
    seoVideosDesc: 'Video content by {name}.',
    seoProjectsDesc: 'Personal projects and open-source work by {name}.',
    testimonialsTitle: 'Testimonials',
    testimonialsSubtitle: 'What people say about working with me',
    noTestimonials: 'No testimonials yet',
    testimonialLeave: 'Leave a testimonial',
    testimonialLeaveDesc: 'Share your experience — it will be published after review',
    testimonialName: 'Your name',
    testimonialCompany: 'Role / Company',
    testimonialContent: 'Your message',
    testimonialRating: 'Rating',
    testimonialImage: 'Photo (optional)',
    testimonialUploadHint: 'Click to upload or drag an image',
    testimonialUploading: 'Uploading…',
    testimonialChoose: 'Choose file',
    testimonialReplace: 'Replace',
    testimonialRemove: 'Remove',
    testimonialUploadFailed: 'Image upload failed',
    testimonialSubmit: 'Submit testimonial',
    testimonialSuccess: 'Thank you! Your testimonial will be reviewed and published soon.',
    rssFeed: 'RSS feed',
    contactTitle: 'Contact',
    contactSubtitle: "I'd love to hear from you",
    contactName: 'Name',
    contactEmail: 'Email',
    contactSubject: 'Subject',
    contactMessage: 'Message',
    contactSend: 'Send Message',
    contactSuccess: 'Message sent successfully!',
    infoEmail: 'Email',
    infoPhone: 'Phone',
    infoLocation: 'Location',
    seoEducationsDesc: 'Academic background and education of {name}.',
    seoContactDesc: 'Get in touch with {name} — email, phone and a contact form.',
  },
  fa: {
    home: 'خانه',
    about: 'درباره من',
    experiences: 'تجربیات',
    skills: 'مهارت‌ها',
    articles: 'مقالات',
    videos: 'ویدیوها',
    projects: 'پروژه‌ها',
    contact: 'تماس',
    toggleTheme: 'تغییر تم',
    toggleLang: 'تغییر زبان',
    menu: 'منو',
    close: 'بستن',
    readMore: 'بیشتر بخوانید',
    years: 'سال',
    present: 'اکنون',
    aboutMeTitle: 'درباره من',
    experiencesTitle: 'تجربیات کاری',
    skillsTitle: 'مهارت‌ها',
    categoryTitle: 'سایر مهارت‌ها',
    educationTitle: 'تحصیلات',
    minRead: 'دقیقه مطالعه',
    likes: 'پسند',
  like: 'پسندیدن',
  liked: 'پسندیده شد',
  unlike: 'برداشتن پسند',
  noArticles: 'هنوز مقاله‌ای وجود ندارد',
  articleNotFound: 'مقاله یافت نشد',
    backToBlog: 'بازگشت به مقالات',
    backToProjects: 'بازگشت به پروژه‌ها',
    tableOfContents: 'فهرست مطالب',
  goBack: 'بازگشت',
    writing: 'نوشته‌ها',
    notFoundTitle: 'صفحه پیدا نشد',
    notFoundMessage: 'صفحه‌ای که دنبالش هستید وجود ندارد یا جابه‌جا شده است.',
    backToHome: 'بازگشت به خانه',
    downloadResume: 'رزومه',
    videosTitle: 'ویدیوها',
    videosSubtitle: 'تماشا',
    noVideos: 'هنوز ویدیویی وجود ندارد',playVideo: 'پخش ویدیو',
    projectsTitle: 'پروژه‌ها',
    projectsSubtitle: 'نمونه‌کارها',
    noProjects: 'هنوز پروژه‌ای وجود ندارد',
    projectLive: 'نمایش زنده',
    projectCode: 'کد منبع',
    seoHomeDesc: 'نمونه‌کار شخصی {name} — توسعه‌دهنده فول‌استک. تجربیات، مهارت‌ها، مقالات و ویدیوها را ببینید.',
    seoAboutDesc: 'درباره {name} بیشتر بدانید — پیشینه، بیوگرافی و تمرکز حرفه‌ای.',
    seoExperiencesDesc: 'سوابق کاری و تاریخچه حرفه‌ای {name}.',
    seoSkillsDesc: 'مهارت‌های فنی و فناوری‌های مورد استفاده {name}.',
    seoBlogDesc: 'مقالات و نوشته‌های {name} درباره توسعه نرم‌افزار و فناوری.',
    seoVideosDesc: 'محتوای ویدیویی {name}.',
    seoProjectsDesc: 'پروژه‌های شخصی و متن‌باز {name}.',
    testimonialsTitle: 'نظرات',
    testimonialsSubtitle: 'دیگران درباره همکاری با من چه می‌گویند',
    noTestimonials: 'هنوز نظری ثبت نشده',
    testimonialLeave: 'ثبت نظر',
    testimonialLeaveDesc: 'تجربه خود را به اشتراک بگذارید — پس از بررسی منتشر خواهد شد',
    testimonialName: 'نام شما',
    testimonialCompany: 'سمت / شرکت',
    testimonialEmail: 'ایمیل',
    testimonialContent: 'پیام شما',
    testimonialRating: 'امتیاز',
    testimonialImage: 'عکس (اختیاری)',
    testimonialUploadHint: 'برای بارگذاری کلیک کنید یا عکس را اینجا بکشید',
    testimonialUploading: 'در حال بارگذاری…',
    testimonialChoose: 'انتخاب فایل',
    testimonialReplace: 'تعویض',
    testimonialRemove: 'حذف',
    testimonialUploadFailed: 'بارگذاری عکس ناموفق بود',
    testimonialSubmit: 'ارسال نظر',
    testimonialSuccess: 'متشکرم! نظر شما پس از بررسی منتشر خواهد شد.',
    rssFeed: 'خوراک RSS',
    contactTitle: 'تماس',
    contactSubtitle: 'پیام شما را می‌شنوم',
    contactName: 'نام',
    contactEmail: 'ایمیل',
    contactSubject: 'موضوع',
    contactMessage: 'پیام',
    contactSend: 'ارسال پیام',
    contactSuccess: 'پیام با موفقیت ارسال شد!',
    infoEmail: 'ایمیل',
    infoPhone: 'تلفن',
    infoLocation: 'موقعیت',
    seoEducationsDesc: 'پیشینه تحصیلی و دانشگاهی {name}.',
    seoContactDesc: 'با {name} در تماس باشید — ایمیل، تلفن و فرم تماس.',
  }
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storageKey = 'app_lang';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly document = inject(DOCUMENT);

  currentLang = signal<Language>('en');

  constructor(private router: Router) {
    const initialUrl = this.router.url || this.document.location?.pathname || '/';
    const routeLang = this.detectLangFromUrl(initialUrl);

    if (routeLang === 'fa') {
      this.currentLang.set('fa');
    } else if (this.isBrowser) {
      const stored = localStorage.getItem(this.storageKey) as Language | null;
      if (stored === 'en' || stored === 'fa') {
        this.currentLang.set(stored);
      }
    }

    this.applyLang(this.currentLang());

    this.router.events
      .pipe(filter((e): e is RoutesRecognized | NavigationEnd => e instanceof RoutesRecognized || e instanceof NavigationEnd))
      .subscribe((event) => {
        const url = event instanceof NavigationEnd ? event.urlAfterRedirects : event.url;
        const langFromRoute = this.detectLangFromUrl(url);
        if (langFromRoute === 'fa' && this.currentLang() !== 'fa') {
          this.currentLang.set('fa');
        } else if (!this.isBrowser && langFromRoute === 'en' && this.currentLang() !== 'en') {
          this.currentLang.set('en');
        }
        this.applyLang(this.currentLang());
      });

    if (this.isBrowser) {
      effect(() => this.applyLang(this.currentLang()));
    }
  }

  t(key: string): string {
    return TRANSLATIONS[this.currentLang()][key] ?? key;
  }

  get isFa(): boolean {
    return this.currentLang() === 'fa';
  }

  /** Prefixes internal routes with `/fa` when Persian mode is active. */
  route(path: string): string {
    const clean = path.startsWith('/') ? path : `/${path}`;
    const base = this.stripLangPrefix(clean);
    if (!this.isFa) {
      return base;
    }
    return base === '/' ? '/fa' : `/fa${base}`;
  }

  stripLangPrefix(url: string): string {
    const path = (url || '/').split(/[?#]/)[0] || '/';
    if (path === '/fa' || path === '/fa/') {
      return '/';
    }
    if (path.startsWith('/fa/')) {
      return path.slice(3) || '/';
    }
    return path;
  }

  private detectLangFromUrl(url: string): Language {
    const path = (url || '/').split(/[?#]/)[0];
    return path === '/fa' || path.startsWith('/fa/') ? 'fa' : 'en';
  }

  toggleLang(): void {
    if (!this.isBrowser) {
      return;
    }
    const next: Language = this.currentLang() === 'en' ? 'fa' : 'en';
    this.currentLang.set(next);
    localStorage.setItem(this.storageKey, next);

    const basePath = this.stripLangPrefix(this.router.url);
    const targetPath = next === 'fa' ? (basePath === '/' ? '/fa' : `/fa${basePath}`) : basePath;
    void this.router.navigate([targetPath], { queryParamsHandling: 'preserve' });
  }

  private applyLang(lang: Language): void {
    const html = this.document?.documentElement;
    if (!html) {
      return;
    }
    html.lang = lang;
    html.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }
}
