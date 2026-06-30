import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
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
      topPages: topPages.map(p => ({ url: p.url, count: Number(p._count.url) })),
      daily: (daily as any[]).map(d => ({ date: d.date, count: Number(d.count) })),
    };
  }
}
