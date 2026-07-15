import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Public static routes of the frontend site that should always appear in the sitemap. */
const STATIC_PATHS = ['', '/about-me', '/experiences', '/skills', '/blog', '/videos', '/projects'];

interface SitemapUrl {
  loc: string;
  lastmod?: string;
}

@Injectable()
export class SitemapService {
  constructor(private readonly prisma: PrismaService) {}

  private get fallbackBaseUrl(): string {
    return (process.env.SITE_URL || 'https://almas98abolfazl.ir').replace(/\/+$/, '');
  }

  private async resolveBaseUrl(): Promise<string> {
    const settings = await this.prisma.siteSettings.findFirst();
    return settings?.siteUrl ? settings.siteUrl.replace(/\/+$/, '') : this.fallbackBaseUrl;
  }

  async generate(): Promise<string> {
    const baseUrl = await this.resolveBaseUrl();
    const articles = await this.prisma.articles.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
    const projects = await this.prisma.projects.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    const urls: SitemapUrl[] = [
      ...STATIC_PATHS.map((path) => ({ loc: `${baseUrl}${path}` })),
      ...articles.map((article) => ({
        loc: `${baseUrl}/blog/${article.slug}`,
        lastmod: article.updatedAt.toISOString(),
      })),
      ...projects.map((project) => ({
        loc: `${baseUrl}/projects/${project.id}`,
        lastmod: project.updatedAt.toISOString(),
      })),
    ];

    const body = urls
      .map((url) => {
        const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : '';
        return `  <url>\n    <loc>${this.escapeXml(url.loc)}</loc>${lastmod}\n  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
