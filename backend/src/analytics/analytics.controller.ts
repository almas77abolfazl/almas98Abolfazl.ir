import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('track')
  track(@Body() body: { url: string }) {
    return this.prisma.pageView.create({
      data: { url: body.url },
    });
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  async stats() {
    const total = await this.prisma.pageView.count();

    const topPages = await this.prisma.pageView.groupBy({
      by: ['url'],
      _count: { url: true },
      orderBy: { _count: { url: 'desc' } },
      take: 10,
    });

    const daily = await this.prisma.$queryRaw`
      SELECT date_trunc('day', "createdAt") as date, count(*) as count
      FROM "PageView"
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `;

    return {
      total: Number(total),
      topPages: topPages.map((p) => ({
        url: p.url,
        count: Number(p._count.url),
      })),
      daily: (daily as any[]).map((d) => ({
        date: d.date,
        count: Number(d.count),
      })),
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

    const topPages = (
      await this.prisma.pageView.groupBy({
        by: ['url'],
        _count: { url: true },
        orderBy: { _count: { url: 'desc' } },
        take: 10,
      })
    ).map((p) => ({ url: p.url, count: Number(p._count.url) }));

    const topLiked = await this.prisma.articles.findMany({
      where: { published: true },
      orderBy: { likeCount: 'desc' },
      take: 10,
      select: { slug: true, title: true, likeCount: true },
    });

    const rawArticleViews = await this.prisma.$queryRaw<{ url: string; views: bigint }[]>`
      SELECT url, count(*)::bigint as views FROM "PageView"
      WHERE url LIKE '/blog/%' GROUP BY url ORDER BY views DESC LIMIT 10
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
      SELECT url, count(*)::bigint as views FROM "PageView"
      WHERE url LIKE '/projects/%' GROUP BY url ORDER BY views DESC LIMIT 10
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

    const daily = await this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT date_trunc('day', "createdAt") as date, count(*)::bigint as count
      FROM "PageView" GROUP BY date ORDER BY date DESC LIMIT 30
    `;

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
      daily: daily.map((d) => ({ date: d.date, count: Number(d.count) })),
    };
  }
}
