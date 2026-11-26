import { NotFoundException } from '@nestjs/common';
import { ArticlesService } from './articles.service';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let prisma: {
    articles: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    articleLike: { create: jest.Mock; findUnique: jest.Mock; delete: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      articles: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      articleLike: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new ArticlesService(prisma as any);
  });

  it('throws NotFoundException for unpublished or missing article', async () => {
    prisma.articles.findUnique.mockResolvedValueOnce(null);
    await expect(service.findBySlug('missing')).rejects.toThrow(NotFoundException);

    prisma.articles.findUnique.mockResolvedValueOnce({ id: '1', slug: 'draft', published: false });
    await expect(service.findBySlug('draft')).rejects.toThrow(NotFoundException);
  });

  it('increments likeCount on first like for a published article', async () => {
    prisma.articles.findUnique.mockResolvedValueOnce({ id: '1', slug: 'post', published: true, likeCount: 3 });
    prisma.articleLike.create.mockResolvedValueOnce({});
    prisma.articles.update.mockResolvedValueOnce({ likeCount: 4 });

    const res = await service.likeArticle('post', '203.0.113.5');
    expect(res).toEqual({ likeCount: 4, alreadyLiked: false });
  });
});
