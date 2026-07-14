import { Injectable, signal } from '@angular/core';
import { ApiService, SiteSettings } from './api.service';

export type SectionKey =
  | 'about'
  | 'experiences'
  | 'educations'
  | 'skills'
  | 'projects'
  | 'articles'
  | 'videos'
  | 'testimonials'
  | 'contact';

const DEFAULT_SECTIONS: Record<SectionKey, boolean> = {
  about: true,
  experiences: true,
  educations: true,
  skills: true,
  projects: true,
  articles: true,
  videos: true,
  testimonials: true,
  contact: true,
};

@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  settings = signal<SiteSettings | null>(null);
  sections = signal<Record<SectionKey, boolean>>({ ...DEFAULT_SECTIONS });

  constructor(private api: ApiService) {
    this.api.getSettings().subscribe({
      next: (s) => {
        this.settings.set(s);
        this.sections.set({
          about: s.showAbout !== false,
          experiences: s.showExperiences !== false,
          educations: s.showEducations !== false,
          skills: s.showSkills !== false,
          projects: s.showProjects !== false,
          articles: s.showArticles !== false,
          videos: s.showVideos !== false,
          testimonials: s.showTestimonials !== false,
          contact: s.showContact !== false,
        });
      },
      error: () => {},
    });
  }

  visible(key: SectionKey): boolean {
    return this.sections()[key] !== false;
  }
}
