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
    noArticles: 'No articles yet',
    articleNotFound: 'Article not found',
    backToBlog: 'Back to Blog',
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
    seoHomeDesc: 'Personal portfolio of Abolfazl Nasiri Almas — full-stack developer. Explore my experiences, skills, articles and videos.',
    seoAboutDesc: 'Learn more about Abolfazl Nasiri Almas — background, biography and professional focus.',
    seoExperiencesDesc: 'Work experience and professional history of Abolfazl Nasiri Almas.',
    seoSkillsDesc: 'Technical skills and technologies used by Abolfazl Nasiri Almas.',
    seoBlogDesc: 'Articles and writing by Abolfazl Nasiri Almas on software development and technology.',
    seoVideosDesc: 'Video content by Abolfazl Nasiri Almas.',
    seoProjectsDesc: 'Personal projects and open-source work by Abolfazl Nasiri Almas.',
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
    seoEducationsDesc: 'Academic background and education of Abolfazl Nasiri Almas.',
    seoContactDesc: 'Get in touch with Abolfazl Nasiri Almas — email, phone and a contact form.',
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
    noArticles: 'هنوز مقاله‌ای وجود ندارد',
    articleNotFound: 'مقاله یافت نشد',
    backToBlog: 'بازگشت به مقالات',
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
    seoHomeDesc: 'نمونه‌کار شخصی ابوالفضل نصیری الماس — توسعه‌دهنده فول‌استک. تجربیات، مهارت‌ها، مقالات و ویدیوها را ببینید.',
    seoAboutDesc: 'درباره ابوالفضل نصیری الماس بیشتر بدانید — پیشینه، بیوگرافی و تمرکز حرفه‌ای.',
    seoExperiencesDesc: 'سوابق کاری و تاریخچه حرفه‌ای ابوالفضل نصیری الماس.',
    seoSkillsDesc: 'مهارت‌های فنی و فناوری‌های مورد استفاده ابوالفضل نصیری الماس.',
    seoBlogDesc: 'مقالات و نوشته‌های ابوالفضل نصیری الماس درباره توسعه نرم‌افزار و فناوری.',
    seoVideosDesc: 'محتوای ویدیویی ابوالفضل نصیری الماس.',
    seoProjectsDesc: 'پروژه‌های شخصی و متن‌باز ابوالفضل نصیری الماس.',
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
    seoEducationsDesc: 'پیشینه تحصیلی و دانشگاهی ابوالفضل نصیری الماس.',
    seoContactDesc: 'با ابوالفضل نصیری الماس در تماس باشید — ایمیل، تلفن و فرم تماس.',
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
