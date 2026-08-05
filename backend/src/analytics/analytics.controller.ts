import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';

interface PageCount {
  url: string;
  count: bigint;
}

interface DailyCount {
  date: Date;
  count: bigint;
}

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('track')
  track(@Body() body: { url: string }) {
    return this.prisma.pageView.create({
      data: { url: this.normalizeUrl(body.url) },
    });
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  async stats() {
    const total = await this.prisma.pageView.count();

    const topPages = await this.getTopPages();

    const daily = await this.getDailyStats();

    return {
      total: Number(total),
      topPages,
      daily,
    };
  }

  @Get('reports')
  @UseGuards(AuthGuard)
  async reports() {
    const totalPageViews = await this.prisma.pageView.count();

    const articleViewsAgg = await this.prisma.$queryRaw<{ c: bigint }[]>`
      SELECT count(*)::bigint as c FROM "PageView" WHERE url LIKE '/blog/%'
    `;
    const articleViews = Number(articleViewsAgg[0]?.c ?? 0);

    const projectViewsAgg = await this.prisma.$queryRaw<{ c: bigint }[]>`
      SELECT count(*)::bigint as c FROM "PageView" WHERE url LIKE '/projects/%'
    `;
    const projectViews = Number(projectViewsAgg[0]?.c ?? 0);

    const totalArticles = await this.prisma.articles.count({ where: { published: true } });
    const totalProjects = await this.prisma.projects.count();

    const likesAgg = await this.prisma.articles.aggregate({
      _sum: { likeCount: true },
      where: { published: true },
    });
    const totalLikes = Number(likesAgg._sum.likeCount ?? 0);

    const topPages = await this.getTopPages();

    const topLiked = await this.prisma.articles.findMany({
      where: { published: true },
      orderBy: { likeCount: 'desc' },
      take: 10,
      select: { slug: true, title: true, likeCount: true },
    });

    const rawArticleViews = await this.prisma.$queryRaw<{ url: string; views: bigint }[]>`
      SELECT normalized_url as url, count(*)::bigint as views
      FROM (
        SELECT COALESCE(NULLIF(regexp_replace(split_part(url, '?', 1), '/+$', ''), ''), '/') as normalized_url
        FROM "PageView"
      ) as page_views
      WHERE normalized_url LIKE '/blog/%'
      GROUP BY normalized_url ORDER BY views DESC LIMIT 10
    `;
    const articleSlugs = rawArticleViews
      .map((v) => v.url.replace('/blog/', '').split('/')[0])
      .filter(Boolean);
    const articleTitles = await this.prisma.articles.findMany({
      where: { slug: { in: articleSlugs } },
      select: { slug: true, title: true },
    });
    const articleBySlug = new Map(articleTitles.map((a) => [a.slug, a]));
    const topViewedArticles = rawArticleViews.map((v) => {
      const slug = v.url.replace('/blog/', '').split('/')[0];
      return {
        slug,
        title: articleBySlug.get(slug)?.title ?? slug,
        views: Number(v.views),
      };
    });

    const rawProjectViews = await this.prisma.$queryRaw<{ url: string; views: bigint }[]>`
      SELECT normalized_url as url, count(*)::bigint as views
      FROM (
        SELECT COALESCE(NULLIF(regexp_replace(split_part(url, '?', 1), '/+$', ''), ''), '/') as normalized_url
        FROM "PageView"
      ) as page_views
      WHERE normalized_url LIKE '/projects/%'
      GROUP BY normalized_url ORDER BY views DESC LIMIT 10
    `;
    const projectIds = rawProjectViews
      .map((v) => v.url.replace('/projects/', '').split('/')[0])
      .filter(Boolean);
    const projectTitles = await this.prisma.projects.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, title: true, titleFa: true },
    });
    const projectById = new Map(projectTitles.map((p) => [p.id, p]));
    const topViewedProjects = rawProjectViews.map((v) => {
      const id = v.url.replace('/projects/', '').split('/')[0];
      const project = projectById.get(id);
      return {
        id,
        title: project ? (project.titleFa || project.title) : id,
        views: Number(v.views),
      };
    });

    const daily = await this.getDailyStats();

    return {
      totals: {
        pageViews: totalPageViews,
        articleViews,
        projectViews,
        articles: totalArticles,
        projects: totalProjects,
        likes: totalLikes,
      },
      topPages,
      articles: { topLiked, topViewed: topViewedArticles },
      projects: { topViewed: topViewedProjects },
      daily,
    };
  }

  /** Groups historical and new page views by their canonical route, without query strings or trailing slashes. */
  private async getTopPages(): Promise<{ url: string; count: number }[]> {
    const pages = await this.prisma.$queryRaw<PageCount[]>`
      SELECT
        COALESCE(NULLIF(regexp_replace(split_part(url, '?', 1), '/+$', ''), ''), '/') as url,
        count(*)::bigint as count
      FROM "PageView"
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 10
    `;
    return pages.map((page) => ({ url: page.url, count: Number(page.count) }));
  }

  private normalizeUrl(url: string): string {
    const path = (url || '/').split(/[?#]/)[0].replace(/\/+$/, '');
    return path || '/';
  }

  /** Returns a complete 30-day series so charts retain days with zero page views. */
  private async getDailyStats(): Promise<{ date: Date; count: number }[]> {
    const daily = await this.prisma.$queryRaw<DailyCount[]>`
      WITH days AS (
        SELECT generate_series(
          date_trunc('day', now()) - interval '29 days',
          date_trunc('day', now()),
          interval '1 day'
        ) AS date
      ),
      page_views AS (
        SELECT date_trunc('day', "createdAt") AS date, count(*)::bigint AS count
        FROM "PageView"
        WHERE "createdAt" >= date_trunc('day', now()) - interval '29 days'
        GROUP BY date
      )
      SELECT days.date, COALESCE(page_views.count, 0)::bigint AS count
      FROM days
      LEFT JOIN page_views ON page_views.date = days.date
      ORDER BY days.date ASC
    `;
    return daily.map((day) => ({ date: day.date, count: Number(day.count) }));
  }
}
