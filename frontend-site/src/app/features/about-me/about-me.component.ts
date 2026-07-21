import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, AboutMe, Experience, Education, Skill, SkillCategory } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';
import { SiteSettingsService } from '../../shared/services/site-settings.service';
import { SiteConfigService } from '../../shared/services/site-config.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

interface SkillGroup {
  key: string;
  title: string;
  titleFa?: string;
  skills: Skill[];
}

type TabKey = 'bio' | 'experience' | 'education' | 'skills' | 'contact';

interface TabDef {
  key: TabKey;
  titleKey: string;
  flag: 'about' | 'experiences' | 'educations' | 'skills' | 'contact';
}

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss'
})
export class AboutMeComponent implements OnInit {
  destroyRef = inject(DestroyRef);
  api = inject(ApiService);
  i18n = inject(I18nService);
  seo = inject(SeoService);
  siteSettings = inject(SiteSettingsService);
  route = inject(ActivatedRoute);
  config = inject(SiteConfigService);

  aboutMe = toSignal(this.api.getAboutMe());
  experiences = toSignal(this.api.getExperiences(), { initialValue: [] });
  educations = toSignal(this.api.getEducations(), { initialValue: [] });
  groups = signal<SkillGroup[]>([]);
  isLoading = signal(true);
  cardView = signal(false);

  tab = signal<TabKey>('bio');

  contact = signal({ name: '', email: '', subject: '', message: '' });
  success = signal(false);
  error = signal('');

  readonly tabs: TabDef[] = [
    { key: 'bio', titleKey: 'aboutMeTitle', flag: 'about' },
    { key: 'experience', titleKey: 'experiencesTitle', flag: 'experiences' },
    { key: 'education', titleKey: 'educationTitle', flag: 'educations' },
    { key: 'skills', titleKey: 'skillsTitle', flag: 'skills' },
    { key: 'contact', titleKey: 'contactTitle', flag: 'contact' },
  ];

  constructor() {}

  ngOnInit(): void {
    this.seo.update({
      title: this.i18n.t('aboutMeTitle'),
      description: this.i18n.t('seoAboutDesc'),
      path: '/about-me',
    });

    const initialTab = this.route.snapshot.queryParamMap.get('tab') as TabKey | null;
    if (initialTab && this.tabs.some(t => t.key === initialTab)) {
      this.tab.set(initialTab);
    }

    this.api.getSettings().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (settings) => this.cardView.set(settings.skillsCardView),
      error: () => this.cardView.set(false),
    });

    this.api.getSkills().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (skills) => this.buildGroups(skills),
      error: () => this.isLoading.set(false),
    });
  }

  get visibleTabs(): TabDef[] {
    return this.tabs.filter(t => this.siteSettings.visible(t.flag));
  }

  get currentTab(): TabKey {
    const t = this.tab();
    if (this.visibleTabs.some(x => x.key === t)) return t;
    return this.visibleTabs[0]?.key ?? 'bio';
  }

  setTab(key: TabKey): void {
    this.tab.set(key);
  }

  // Skills grouping (mirrors the old standalone Skills page)
  private buildGroups(skills: Skill[]): void {
    const skillMap = new Map(skills.map((s) => [s.id, s]));
    this.api.getSkillCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (cats: SkillCategory[]) => {
        let groups: SkillGroup[];
        if (cats.length) {
          groups = cats.map((c) => ({
            key: c.id,
            title: c.title,
            titleFa: c.titleFa,
            skills: c.skills.map((s) => skillMap.get(s.id) ?? s),
          }));
          const groupedIds = new Set(cats.flatMap((c) => c.skills.map((s) => s.id)));
          const orphans = skills.filter((s) => !groupedIds.has(s.id));
          if (orphans.length) {
            groups.push({
              key: '__uncategorized',
              title: this.i18n.t('categoryTitle'),
              titleFa: this.i18n.t('categoryTitle'),
              skills: orphans,
            });
          }
        } else {
          const acc: Record<string, Skill[]> = {};
          for (const s of skills) {
            const key = s.category || this.i18n.t('categoryTitle');
            (acc[key] ??= []).push(s);
          }
          groups = Object.entries(acc).map(([key, value]) => ({
            key,
            title: key,
            titleFa: skills.find((s) => s.category === key)?.categoryFa ?? key,
            skills: value,
          }));
        }
        this.groups.set(groups);
        this.isLoading.set(false);
      },
      error: () => {
        const acc: Record<string, Skill[]> = {};
        for (const s of skills) {
          const key = s.category || this.i18n.t('categoryTitle');
          (acc[key] ??= []).push(s);
        }
        const groups = Object.entries(acc).map(([key, value]) => ({
          key,
          title: key,
          titleFa: skills.find((s) => s.category === key)?.categoryFa ?? key,
          skills: value,
        }));
        this.groups.set(groups);
        this.isLoading.set(false);
      },
    });
  }

  getProficiencyWidth(proficiency?: number): number {
    return proficiency ?? 0;
  }

  get resumeHref(): string | undefined {
    const url = this.aboutMe()?.resumeUrl;
    if (!url) return undefined;
    return this.config.assetUrl(url);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.i18n.currentLang() === 'fa' ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'short',
    });
  }

  updateContact(key: string, value: string): void {
    this.contact.update(c => ({ ...c, [key]: value }));
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onSubmit(): void {
    this.error.set('');
    this.success.set(false);
    const form = this.contact();
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (!name || !message) {
      this.error.set(this.i18n.isFa ? 'نام و پیام الزامی است' : 'Name and message are required');
      return;
    }
    if (!this.isValidEmail(email)) {
      this.error.set(this.i18n.isFa ? 'یک ایمیل معتبر وارد کنید' : 'Please enter a valid email');
      return;
    }
    this.api.postContactMessage(form).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.success.set(true);
        this.contact.set({ name: '', email: '', subject: '', message: '' });
      },
      error: () => {
        this.error.set(this.i18n.isFa ? 'خطا در ارسال پیام' : 'Failed to send message');
      }
    });
  }
}
