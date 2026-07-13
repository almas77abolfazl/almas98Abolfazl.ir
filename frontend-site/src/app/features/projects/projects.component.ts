import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Project } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal(true);

  constructor(
    public i18n: I18nService,
    private api: ApiService,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.update({
      title: this.i18n.t('projectsTitle'),
      description: this.i18n.t('seoProjectsDesc'),
      path: '/projects',
    });

    this.api.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
