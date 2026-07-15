import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { marked } from 'marked';
import { ApiService, Project } from '../../shared/services/api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { SeoService } from '../../shared/services/seo.service';
import { SiteConfigService } from '../../shared/services/site-config.service';

@Component({
  selector: 'app-project-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './project-detail.component.html',
})
export class ProjectDetailComponent implements OnInit {
  project = signal<Project | null>(null);
  loading = signal(true);

  descriptionHtml = computed<string>(() => {
    const p = this.project();
    if (!p) return '';
    const raw = this.i18n.isFa ? p.descriptionFa || p.description : p.description;
    if (!raw) return '';
    return marked.parse(raw, { async: false }) as string;
  });

  constructor(
    public i18n: I18nService,
    private api: ApiService,
    private route: ActivatedRoute,
    private seo: SeoService,
    private config: SiteConfigService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.api.getProjectById(id).subscribe({
      next: (data) => {
        this.project.set(data);
        this.loading.set(false);
        this.applySeo(data);
      },
      error: () => {
        this.loading.set(false);
        this.seo.update({
          title: this.i18n.t('articleNotFound'),
          description: this.i18n.t('seoProjectsDesc'),
          path: `/projects/${id}`,
        });
      },
    });
  }

  private applySeo(project: Project): void {
    const description = (this.i18n.isFa ? project.descriptionFa : project.description)?.trim()
      || project.description?.slice(0, 160) || '';
    const path = `/projects/${project.id}`;
    this.seo.update({
      title: this.i18n.isFa ? (project.titleFa || project.title) : project.title,
      description,
      image: project.coverUrl,
      path,
      type: 'article',
    });

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: this.i18n.isFa ? (project.titleFa || project.title) : project.title,
      description,
      author: { '@type': 'Person', name: this.config.displayName() },
    };
    if (project.coverUrl) {
      schema['image'] = project.coverUrl;
    }
    if (project.liveUrl) {
      schema['url'] = project.liveUrl;
    }
    this.seo.setJsonLd(schema);
  }

  title(project: Project): string {
    return this.i18n.isFa ? (project.titleFa || project.title) : project.title;
  }
}
