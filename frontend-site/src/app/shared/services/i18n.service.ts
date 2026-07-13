import { Injectable, signal, effect } from '@angular/core';
import { Router } from '@angular/router';

export type Language = 'en' | 'fa';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    home: 'Home',
    about: 'About Me',
    experiences: 'Experiences',
    skills: 'Skills',
    articles: 'Articles',
    videos: 'Videos',
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
    educationTitle: 'Education',
    minRead: 'min read',
    likes: 'likes',
    like: 'Like',
    liked: 'Liked',
    noArticles: 'No articles yet',
    articleNotFound: 'Article not found',
    backToBlog: 'Back to Blog',
    goBack: 'Go back',
    writing: 'Writing',
    videosTitle: 'Videos',
    videosSubtitle: 'Watch',
    noVideos: 'No videos yet',
    playVideo: 'Play video',
    seoHomeDesc: 'Personal portfolio of Abolfazl Nasiri Almas — full-stack developer. Explore my experiences, skills, articles and videos.',
    seoAboutDesc: 'Learn more about Abolfazl Nasiri Almas — background, biography and professional focus.',
    seoExperiencesDesc: 'Work experience and professional history of Abolfazl Nasiri Almas.',
    seoSkillsDesc: 'Technical skills and technologies used by Abolfazl Nasiri Almas.',
    seoBlogDesc: 'Articles and writing by Abolfazl Nasiri Almas on software development and technology.',
    seoVideosDesc: 'Video content by Abolfazl Nasiri Almas.',
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
  },
  fa: {
    home: 'خانه',
    about: 'درباره من',
    experiences: 'تجربیات',
    skills: 'مهارت‌ها',
    articles: 'مقالات',
    videos: 'ویدیوها',
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
    educationTitle: 'تحصیلات',
    minRead: 'دقیقه مطالعه',
    likes: 'پسند',
    like: 'پسندیدن',
    liked: 'پسندیده شد',
    noArticles: 'هنوز مقاله‌ای وجود ندارد',
    articleNotFound: 'مقاله یافت نشد',
    backToBlog: 'بازگشت به مقالات',
    goBack: 'بازگشت',
    writing: 'نوشته‌ها',
    videosTitle: 'ویدیوها',
    videosSubtitle: 'تماشا',
    noVideos: 'هنوز ویدیویی وجود ندارد',
    playVideo: 'پخش ویدیو',
    seoHomeDesc: 'نمونه‌کار شخصی ابوالفضل نصیری الماس — توسعه‌دهنده فول‌استک. تجربیات، مهارت‌ها، مقالات و ویدیوها را ببینید.',
    seoAboutDesc: 'درباره ابوالفضل نصیری الماس بیشتر بدانید — پیشینه، بیوگرافی و تمرکز حرفه‌ای.',
    seoExperiencesDesc: 'سوابق کاری و تاریخچه حرفه‌ای ابوالفضل نصیری الماس.',
    seoSkillsDesc: 'مهارت‌های فنی و فناوری‌های مورد استفاده ابوالفضل نصیری الماس.',
    seoBlogDesc: 'مقالات و نوشته‌های ابوالفضل نصیری الماس درباره توسعه نرم‌افزار و فناوری.',
    seoVideosDesc: 'محتوای ویدیویی ابوالفضل نصیری الماس.',
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
  }
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storageKey = 'app_lang';

  currentLang = signal<Language>('en');

  constructor(private router: Router) {
    const stored = localStorage.getItem(this.storageKey) as Language | null;
    if (stored) {
      this.currentLang.set(stored);
    }
    this.applyLang(this.currentLang());
    effect(() => this.applyLang(this.currentLang()));
  }

  t(key: string): string {
    return TRANSLATIONS[this.currentLang()][key] ?? key;
  }

  get isFa(): boolean {
    return this.currentLang() === 'fa';
  }

  toggleLang(): void {
    const next: Language = this.currentLang() === 'en' ? 'fa' : 'en';
    this.currentLang.set(next);
    localStorage.setItem(this.storageKey, next);
  }

  private applyLang(lang: Language): void {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }
}
