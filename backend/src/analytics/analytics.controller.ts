import { BadRequestException, Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { TrackPageViewDto } from './dto/track-page-view.dto';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Post('track')
  track(@Body() body: TrackPageViewDto, @Req() req: Request) {
    if (this.isAdminRequest(req)) {
      return { success: true, ignored: true };
    }
    return this.prisma.pageView.create({
      data: { url: this.normalizeUrl(body.url) },
    });
  }

  private isAdminRequest(req: Request): boolean {
    try {
      const cookieHeader = req.headers.cookie;
      if (cookieHeader && /(?:^|;\s*)is_admin=1(?=$|;)/.test(cookieHeader)) {
        return true;
      }
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const [type, token] = authHeader.split(' ');
        if (type === 'Bearer' && token && this.authService.verifyToken(token)) {
          return true;
        }
      }
    } catch {
      // fallback
    }
    return false;
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
  async reports(
    @Query('days') days?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
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

    const daily = await this.getDailyStats(days, from, to);

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

  /** Returns a zero-filled date series for the requested report period. */
  private async getDailyStats(days?: string, from?: string, to?: string): Promise<{ date: Date; count: number }[]> {
    const { start, end } = this.resolveDailyRange(days, from, to);
    const daily = await this.prisma.$queryRaw<DailyCount[]>`
      WITH bounds AS (
        SELECT date_trunc('day', ${start}::timestamp) AS start_date,
               date_trunc('day', ${end}::timestamp) AS end_date
      ), days AS (
        SELECT generate_series(bounds.start_date, bounds.end_date, interval '1 day') AS date
        FROM bounds
      ),
      page_views AS (
        SELECT date_trunc('day', "createdAt") AS date, count(*)::bigint AS count
        FROM "PageView", bounds
        WHERE "createdAt" >= bounds.start_date
          AND "createdAt" < bounds.end_date + interval '1 day'
        GROUP BY date
      )
      SELECT days.date, COALESCE(page_views.count, 0)::bigint AS count
      FROM days
      LEFT JOIN page_views ON page_views.date = days.date
      ORDER BY days.date ASC
    `;
    return daily.map((day) => ({ date: day.date, count: Number(day.count) }));
  }

  /** Supports `days` or an explicit inclusive `from` / `to` date range (maximum 365 days). */
  private resolveDailyRange(days?: string, from?: string, to?: string): { start: Date; end: Date } {
    if (from || to) {
      if (!from || !to) {
        throw new BadRequestException('Both from and to query parameters are required together.');
      }
      const start = this.parseReportDate(from, 'from');
      const end = this.parseReportDate(to, 'to');
      if (start > end) {
        throw new BadRequestException('from must not be after to.');
      }
      const duration = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
      if (duration > 365) {
        throw new BadRequestException('The report range cannot exceed 365 days.');
      }
      return { start, end };
    }

    const requestedDays = days === undefined ? 30 : Number(days);
    if (!Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 365) {
      throw new BadRequestException('days must be an integer between 1 and 365.');
    }
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - requestedDays + 1);
    return { start, end };
  }

  private parseReportDate(value: string, name: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException(`${name} must use YYYY-MM-DD format.`);
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      throw new BadRequestException(`${name} must be a valid date.`);
    }
    return date;
  }
}
