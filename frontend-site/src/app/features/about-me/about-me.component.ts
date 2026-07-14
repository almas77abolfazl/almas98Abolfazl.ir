import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, AboutMe, Experience, Education, Skill, SkillCategory } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';
import { SiteSettingsService } from '../../shared/services/site-settings.service';
import { SiteConfigService } from '../../shared/services/site-config.service';
import { ActivatedRoute } from '@angular/router';

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
  aboutMe?: AboutMe;
  experiences: Experience[] = [];
  educations: Education[] = [];
  groups = signal<SkillGroup[]>([]);
  isLoading = signal(true);
  cardView = signal(false);

  tab = signal<TabKey>('bio');

  contact = { name: '', email: '', subject: '', message: '' };
  success = false;
  error = '';

  readonly tabs: TabDef[] = [
    { key: 'bio', titleKey: 'aboutMeTitle', flag: 'about' },
    { key: 'experience', titleKey: 'experiencesTitle', flag: 'experiences' },
    { key: 'education', titleKey: 'educationTitle', flag: 'educations' },
    { key: 'skills', titleKey: 'skillsTitle', flag: 'skills' },
    { key: 'contact', titleKey: 'contactTitle', flag: 'contact' },
  ];

  constructor(
    public i18n: I18nService,
    private api: ApiService,
    private seo: SeoService,
    public siteSettings: SiteSettingsService,
    private route: ActivatedRoute,
    private config: SiteConfigService,
  ) {}

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

    this.api.getAboutMe().subscribe(data => this.aboutMe = data);
    this.api.getExperiences().subscribe(data => this.experiences = data);
    this.api.getEducations().subscribe(data => this.educations = data);

    this.api.getSettings().subscribe({
      next: (settings) => this.cardView.set(settings.skillsCardView),
      error: () => this.cardView.set(false),
    });

    this.api.getSkills().subscribe({
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
    this.api.getSkillCategories().subscribe({
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
    const url = this.aboutMe?.resumeUrl;
    if (!url) return undefined;
    return this.config.assetUrl(url);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.i18n.currentLang() === 'fa' ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'short',
    });
  }

  // Contact form (moved from the home page)
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onSubmit(): void {
    this.error = '';
    this.success = false;
    const name = this.contact.name.trim();
    const email = this.contact.email.trim();
    const message = this.contact.message.trim();
    if (!name || !message) {
      this.error = this.i18n.isFa ? 'نام و پیام الزامی است' : 'Name and message are required';
      return;
    }
    if (!this.isValidEmail(email)) {
      this.error = this.i18n.isFa ? 'یک ایمیل معتبر وارد کنید' : 'Please enter a valid email';
      return;
    }
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
