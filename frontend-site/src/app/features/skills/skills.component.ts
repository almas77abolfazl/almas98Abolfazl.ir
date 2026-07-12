import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';
import { Skill } from '../../shared/services/api.service';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent implements OnInit {
  skills: Skill[] = [];
  groupedSkills: Record<string, Skill[]> = {};
  isLoading = true;
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
      next: data => {
        this.skills = data;
        this.groupedSkills = data.reduce((acc, skill) => {
          if (!acc[skill.category]) acc[skill.category] = [];
          acc[skill.category].push(skill);
          return acc;
        }, {} as Record<string, Skill[]>);
      },
      complete: () => this.isLoading = false
    });
  }

  getProficiencyWidth(proficiency?: number): number {
    return proficiency ?? 0;
  }
}
