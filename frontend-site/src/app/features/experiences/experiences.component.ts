import { Component, OnInit, signal } from '@angular/core';

import { ApiService } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';
import { Experience } from '../../shared/services/api.service';

@Component({
  selector: 'app-experiences',
  standalone: true,
  imports: [],
  templateUrl: './experiences.component.html',
  styleUrl: './experiences.component.scss'
})
export class ExperiencesComponent implements OnInit {
  experiences = signal<Experience[]>([]);
  isLoading = signal(true);

  constructor(
    public i18n: I18nService,
    private api: ApiService,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.seo.update({
      title: this.i18n.t('experiencesTitle'),
      description: this.i18n.t('seoExperiencesDesc'),
      path: '/experiences',
    });

    this.api.getExperiences().subscribe({
      next: data => this.experiences.set(data),
      complete: () => this.isLoading.set(false)
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.i18n.currentLang() === 'fa' ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'short'
    });
  }
}
