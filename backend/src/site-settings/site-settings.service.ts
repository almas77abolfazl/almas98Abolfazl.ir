import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const existing = await this.prisma.siteSettings.findFirst();
    if (existing) return existing;
    return this.prisma.siteSettings.create({ data: { skillsCardView: false } });
  }

  async updateSettings(data: { skillsCardView?: boolean }) {
    const existing = await this.prisma.siteSettings.findFirst();
    if (existing) {
      return this.prisma.siteSettings.update({ where: { id: existing.id }, data });
    }
    return this.prisma.siteSettings.create({ data });
  }
}
