import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RssService {
  constructor(private readonly prisma: PrismaService) {}

  private get baseUrl(): string {
    return (process.env.SITE_URL || 'https://almas98abolfazl.ir').replace(/\/+$/, '');
  }

  private get siteName(): string {
    return process.env.SITE_NAME || 'almas98Abolfazl.ir';
  }

  private get siteDescription(): string {
    return (
      process.env.SITE_DESCRIPTION ||
      'Articles and writing by Abolfazl Nasiri Almas — full-stack developer.'
    );
  }

  async generate(language?: string): Promise<string> {
    const articles = await this.prisma.articles.findMany({
      where: {
        published: true,
        ...(language ? { language } : {}),
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });

    const self = `${this.baseUrl}/feed.xml`;
    const lastBuildDate = (articles[0]?.publishedAt ?? articles[0]?.createdAt ?? new Date()).toUTCString();

    const items = articles
      .map((article) => {
        const link = `${this.baseUrl}/blog/${article.slug}`;
        const pubDate = (article.publishedAt ?? article.createdAt).toUTCString();
        const categories = (article.tags ?? [])
          .map((tag) => `\n      <category>${this.escapeXml(tag)}</category>`)
          .join('');
        const description = article.excerpt ? this.cdata(article.excerpt) : '';
        const content = article.content ? `\n      <content:encoded>${this.cdata(article.content)}</content:encoded>` : '';

        return (
          `    <item>\n` +
          `      <title>${this.escapeXml(article.title)}</title>\n` +
          `      <link>${this.escapeXml(link)}</link>\n` +
          `      <guid isPermaLink="true">${this.escapeXml(link)}</guid>\n` +
          `      <pubDate>${pubDate}</pubDate>\n` +
          (description ? `      <description>${description}</description>\n` : '') +
          categories +
          content +
          `\n    </item>`
        );
      })
      .join('\n');

    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n` +
      `  <channel>\n` +
      `    <title>${this.escapeXml(this.siteName)}</title>\n` +
      `    <link>${this.escapeXml(this.baseUrl)}/blog</link>\n` +
      `    <description>${this.escapeXml(this.siteDescription)}</description>\n` +
      `    <language>${language ?? 'en'}</language>\n` +
      `    <lastBuildDate>${lastBuildDate}</lastBuildDate>\n` +
      `    <atom:link href="${this.escapeXml(self)}" rel="self" type="application/rss+xml" />\n` +
      `${items}\n` +
      `  </channel>\n` +
      `</rss>\n`
    );
  }

  private cdata(value: string): string {
    // Guard against a literal ]]> sequence breaking out of the CDATA block.
    return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
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
