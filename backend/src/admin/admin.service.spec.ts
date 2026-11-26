import { AdminService } from './admin.service';

describe('AdminService (articles)', () => {
  let service: AdminService;
  let prisma: { articles: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock } };

  beforeEach(() => {
    prisma = {
      articles: {
        create: jest.fn(({ data }) => Promise.resolve(data)),
        findUnique: jest.fn(),
        update: jest.fn(({ data }) => Promise.resolve(data)),
      },
    };
    service = new AdminService(prisma as any, {} as any);
  });

  it('assigns publishedAt on initial publish when creating a published article', async () => {
    const res = await service.createArticle({
      title: 'Hello',
      slug: 'hello',
      content: 'word '.repeat(250),
      published: true,
    });
    expect(res.publishedAt).toBeInstanceOf(Date);
    expect(res.readingTime).toBe(2);
  });

  it('assigns publishedAt on draft-to-published transition and preserves existing publishedAt', async () => {
    prisma.articles.findUnique.mockResolvedValueOnce({ published: false, publishedAt: null });
    const firstPublish = await service.updateArticle('a1', { published: true });
    expect(firstPublish.publishedAt).toBeInstanceOf(Date);

    const existingDate = new Date('2025-01-01T00:00:00.000Z');
    prisma.articles.findUnique.mockResolvedValueOnce({ published: true, publishedAt: existingDate });
    const reEdit = await service.updateArticle('a1', { title: 'Updated', published: true });
    expect(reEdit.publishedAt).toBeUndefined();
  });
});
