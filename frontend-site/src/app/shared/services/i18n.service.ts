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
