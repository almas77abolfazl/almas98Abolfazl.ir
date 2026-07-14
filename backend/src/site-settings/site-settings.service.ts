import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const existing = await this.prisma.siteSettings.findFirst();
    if (existing) return existing;
    return this.prisma.siteSettings.create({ data: { skillsCardView: false, themeMode: 'default' } });
  }

  async updateSettings(data: {
    skillsCardView?: boolean;
    themeMode?: string;
    themePrimary?: string;
    themeSecondary?: string;
    siteName?: string;
    siteUrl?: string;
    showAbout?: boolean;
    showExperiences?: boolean;
    showEducations?: boolean;
    showSkills?: boolean;
    showProjects?: boolean;
    showArticles?: boolean;
    showVideos?: boolean;
    showTestimonials?: boolean;
    showContact?: boolean;
  }) {
    const existing = await this.prisma.siteSettings.findFirst();
    if (existing) {
      return this.prisma.siteSettings.update({ where: { id: existing.id }, data });
    }
    return this.prisma.siteSettings.create({ data });
  }
}
