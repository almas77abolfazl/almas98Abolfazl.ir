import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished() {
    return this.prisma.articles.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.articles.findUnique({
      where: { slug },
    });
    if (!article || !article.published) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }
}
