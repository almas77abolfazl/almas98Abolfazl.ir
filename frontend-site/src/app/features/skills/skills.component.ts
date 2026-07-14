import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Skill, SkillCategory } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';

interface SkillGroup {
  key: string;
  title: string;
  titleFa?: string;
  skills: Skill[];
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent implements OnInit {
  groups = signal<SkillGroup[]>([]);
  isLoading = signal(true);
  cardView = signal(false);

  constructor(
    public i18n: I18nService,
    private api: ApiService,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.seo.update({
      title: this.i18n.t('skillsTitle'),
      description: this.i18n.t('seoSkillsDesc'),
      path: '/skills',
    });

    this.api.getSettings().subscribe({
      next: (settings) => this.cardView.set(settings.skillsCardView),
      error: () => this.cardView.set(false),
    });

    this.api.getSkills().subscribe({
      next: (skills) => this.buildGroups(skills),
      error: () => this.isLoading.set(false),
    });
  }

  private buildGroups(skills: Skill[]): void {
    const skillMap = new Map(skills.map((s) => [s.id, s]));
    this.api.getSkillCategories().subscribe({
      next: (cats) => {
        let groups: SkillGroup[];
        if (cats.length) {
          groups = cats.map((c) => ({
            key: c.id,
            title: c.title,
            titleFa: c.titleFa,
            skills: c.skills.map((s) => skillMap.get(s.id) ?? s),
          }));
          // Legacy skills without a category (or whose category no longer exists)
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
          // Fallback: group by the legacy `category` string field
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
        // Fallback to legacy grouping on category endpoint failure
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
}

