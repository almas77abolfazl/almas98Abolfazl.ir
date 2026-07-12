import { Injectable, signal, effect } from '@angular/core';

export type Language = 'en' | 'fa';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    appName: 'Admin Panel',
    // Nav
    nav_dashboard: 'Dashboard',
    nav_about: 'About Me',
    nav_experiences: 'Experiences',
    nav_educations: 'Educations',
    nav_skills: 'Skills',
    nav_articles: 'Articles',
    nav_videos: 'Videos',
    nav_testimonials: 'Testimonials',
    nav_messages: 'Messages',
    // Actions
    logout: 'Logout',
    login: 'Login',
    login_title: 'Admin Login',
    username: 'Username',
    password: 'Password',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    add: 'Add',
    update: 'Update',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    // Theme / language
    toggleTheme: 'Toggle theme',
    themeLight: 'Light mode',
    themeDark: 'Dark mode',
    toggleLang: 'Toggle language',
    menu: 'Menu',
    close: 'Close',
    // Dashboard
    dash_messages: 'Total Messages',
    dash_pending: 'Pending Testimonials',
    dash_views: 'Total Page Views',
    dash_topPages: 'Top Pages',
    dash_dailyTraffic: 'Daily Traffic (Last 30 Days)',
    noData: 'No data yet',
    // Articles
    art_language: 'Language',
    art_langEn: 'English',
    art_langFa: 'فارسی',
    art_slug: 'Slug',
    art_tags: 'Tags (comma-separated)',
    art_excerpt: 'Excerpt',
    art_content: 'Content',
    art_coverUrl: 'Cover URL',
    art_published: 'Published',
    art_readingTime: 'Estimated reading time: {n} min (auto-calculated on save)',
    art_read: 'Read',
    art_likes: 'Likes',
    // Videos
    vid_title: 'Title',
    vid_description: 'Description',
    vid_platform: 'Platform',
    vid_youtube: 'YouTube',
    vid_aparat: 'Aparat',
    vid_videoId: 'Video ID / Hash',
    vid_videoIdHelpYoutube: "YouTube video ID (the v= part of the URL).",
    vid_videoIdHelpAparat: 'Aparat video hash (from the share/embed URL).',
    vid_thumbnail: 'Thumbnail URL (optional)',
    vid_order: 'Order',
    vid_preview: 'Preview',
    // Testimonials
    test_approve: 'Approve',
    test_reject: 'Reject',
    test_approved: 'Approved',
    test_rejected: 'Rejected',
    test_pending: 'Pending',
    // Messages
    msg_read: 'Read',
    msg_unread: 'Unread',
    msg_markRead: 'Mark as Read',
    msg_subject: 'Subject',
    msg_noSubject: 'No subject',
    // Shared
    status: 'Status',
    published: 'Published',
    draft: 'Draft',
    actions: 'Actions',
    confirm_title: 'Confirm',
    confirm_delete: 'Are you sure you want to delete this item? This action cannot be undone.',
    confirm_yes: 'Delete',
    confirm_no: 'Cancel',
    toast_saved: 'Saved successfully',
    toast_added: 'Added successfully',
    toast_updated: 'Updated successfully',
    toast_deleted: 'Deleted',
    noItems: 'No items yet',
    toast_uploaded: 'Uploaded successfully',
    upload_failed: 'Upload failed',
    uploading: 'Uploading...',
    upload_drop: 'Drag & drop an image here, or click to browse',
    replace: 'Replace',
    choose_file: 'Choose file',
    remove: 'Remove',
    // About Me
    about_fullName: 'Full Name',
    about_title: 'Title',
    about_bio: 'Bio',
    about_avatarUrl: 'Avatar URL',
    about_resumeUrl: 'Resume URL',
    about_saved: 'Saved successfully!',
    // Educations
    edu_degree: 'Degree',
    edu_institution: 'Institution',
    edu_field: 'Field',
    edu_startDate: 'Start Date',
    edu_endDate: 'End Date',
    edu_description: 'Description',
    // Experiences
    exp_role: 'Role',
    exp_company: 'Company',
    exp_technologies: 'Technologies (comma separated)',
    exp_start: 'Start',
    // Skills
    skill_name: 'Name',
    skill_category: 'Category',
    skill_proficiency: 'Proficiency (0-100)',
  },
  fa: {
    appName: 'پنل ادمین',
    nav_dashboard: 'داشبورد',
    nav_about: 'درباره من',
    nav_experiences: 'تجربیات',
    nav_educations: 'تحصیلات',
    nav_skills: 'مهارت‌ها',
    nav_articles: 'مقالات',
    nav_videos: 'ویدیوها',
    nav_testimonials: 'توصیه‌نامه‌ها',
    nav_messages: 'پیام‌ها',
    logout: 'خروج',
    login: 'ورود',
    login_title: 'ورود به پنل ادمین',
    username: 'نام کاربری',
    password: 'گذرواژه',
    signIn: 'ورود',
    signingIn: 'در حال ورود...',
    add: 'افزودن',
    update: 'به‌روزرسانی',
    edit: 'ویرایش',
    delete: 'حذف',
    cancel: 'انصراف',
    save: 'ذخیره',
    toggleTheme: 'تغییر تم',
    themeLight: 'حالت روشن',
    themeDark: 'حالت تاریک',
    toggleLang: 'تغییر زبان',
    menu: 'منو',
    close: 'بستن',
    dash_messages: 'مجموع پیام‌ها',
    dash_pending: 'توصیه‌نامه‌های در انتظار',
    dash_views: 'مجموع بازدیدها',
    dash_topPages: 'پربازدیدترین صفحات',
    dash_dailyTraffic: 'ترافیک روزانه (۳۰ روز گذشته)',
    noData: 'داده‌ای وجود ندارد',
    art_language: 'زبان',
    art_langEn: 'انگلیسی',
    art_langFa: 'فارسی',
    art_slug: 'اسلاگ',
    art_tags: 'برچسب‌ها (با کاما جدا شود)',
    art_excerpt: 'خلاصه',
    art_content: 'محتوا',
    art_coverUrl: 'نشانی تصویر شاخص',
    art_published: 'منتشرشده',
    art_readingTime: 'زمان تقریبی مطالعه: {n} دقیقه (به‌طور خودکار محاسبه می‌شود)',
    art_read: 'زمان مطالعه',
    art_likes: 'پسندها',
    vid_title: 'عنوان',
    vid_description: 'توضیحات',
    vid_platform: 'پلتفرم',
    vid_youtube: 'یوتیوب',
    vid_aparat: 'آپارات',
    vid_videoId: 'شناسه ویدیو / هش',
    vid_videoIdHelpYoutube: 'شناسه ویدیوی یوتیوب (بخش v= آدرس).',
    vid_videoIdHelpAparat: 'هش ویدیوی آپارات (از آدرس اشتراک‌گذاری).',
    vid_thumbnail: 'نشانی تصویر کوچک (اختیاری)',
    vid_order: 'ترتیب',
    vid_preview: 'پیش‌نمایش',
    test_approve: 'تایید',
    test_reject: 'رد',
    test_approved: 'تایید‌شده',
    test_rejected: 'رد‌شده',
    test_pending: 'در انتظار',
    msg_read: 'خوانده‌شده',
    msg_unread: 'خوانده‌نشده',
    msg_markRead: 'علامت‌گذاری به عنوان خوانده‌شده',
    msg_subject: 'موضوع',
    msg_noSubject: 'بدون موضوع',
    status: 'وضعیت',
    published: 'منتشر‌شده',
    draft: 'پیش‌نویس',
    actions: 'عملیات',
    confirm_title: 'تایید',
    confirm_delete: 'آیا مطمئنید که می‌خواهید این مورد را حذف کنید؟ این عمل غیرقابل بازگشت است.',
    confirm_yes: 'حذف',
    confirm_no: 'انصراف',
    toast_saved: 'با موفقیت ذخیره شد',
    toast_added: 'با موفقیت افزوده شد',
    toast_updated: 'با موفقیت به‌روزرسانی شد',
    toast_deleted: 'حذف شد',
    noItems: 'هنوز موردی وجود ندارد',
    toast_uploaded: 'با موفقیت آپلود شد',
    upload_failed: 'آپلود ناموفق بود',
    uploading: 'در حال آپلود...',
    upload_drop: 'تصویر را اینجا رها کنید یا برای انتخاب کلیک کنید',
    replace: 'جایگزینی',
    choose_file: 'انتخاب فایل',
    remove: 'حذف',
    about_fullName: 'نام کامل',
    about_title: 'عنوان',
    about_bio: 'بیوگرافی',
    about_avatarUrl: 'نشانی آواتار',
    about_resumeUrl: 'نشانی رزومه',
    about_saved: 'با موفقیت ذخیره شد!',
    edu_degree: 'مدرک',
    edu_institution: 'موسسه',
    edu_field: 'رشته',
    edu_startDate: 'تاریخ شروع',
    edu_endDate: 'تاریخ پایان',
    edu_description: 'توضیحات',
    exp_role: 'سمت',
    exp_company: 'شرکت',
    exp_technologies: 'فناوری‌ها (با کاما جدا شود)',
    exp_start: 'شروع',
    skill_name: 'نام',
    skill_category: 'دسته‌بندی',
    skill_proficiency: 'تسلط (۰-۱۰۰)',
  },
};

@Injectable({ providedIn: 'root' })
export class AdminI18nService {
  private readonly storageKey = 'admin_lang';

  currentLang = signal<Language>('fa');

  constructor() {
    const stored = localStorage.getItem(this.storageKey) as Language | null;
    if (stored === 'en' || stored === 'fa') {
      this.currentLang.set(stored);
    }
    this.applyLang(this.currentLang());
    effect(() => this.applyLang(this.currentLang()));
  }

  t(key: string, params?: Record<string, string | number>): string {
    let str = TRANSLATIONS[this.currentLang()][key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
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
