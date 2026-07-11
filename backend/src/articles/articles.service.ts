import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(language?: string) {
    return this.prisma.articles.findMany({
      where: {
        published: true,
        ...(language ? { language } : {}),
      },
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

  async likeArticle(slug: string, ip: string): Promise<{ likeCount: number; alreadyLiked: boolean }> {
    const article = await this.prisma.articles.findUnique({ where: { slug } });
    if (!article || !article.published) {
      throw new NotFoundException('Article not found');
    }

    const ipHash = createHash('sha256').update(ip).digest('hex');

    try {
      await this.prisma.articleLike.create({
        data: { articleId: article.id, ipHash },
      });
    } catch (error) {
      // Unique constraint violation → this IP has already liked the article.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { likeCount: article.likeCount, alreadyLiked: true };
      }
      throw error;
    }

    const updated = await this.prisma.articles.update({
      where: { id: article.id },
      data: { likeCount: { increment: 1 } },
    });

    return { likeCount: updated.likeCount, alreadyLiked: false };
  }
}
