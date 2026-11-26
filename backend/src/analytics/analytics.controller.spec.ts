import { BadRequestException } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { RateLimitService } from '../common/rate-limit.service';

describe('AnalyticsController (track)', () => {
  let controller: AnalyticsController;
  let prisma: { pageView: { create: jest.Mock } };
  let authService: { verifyToken: jest.Mock };
  let rateLimit: RateLimitService;

  beforeEach(() => {
    prisma = {
      pageView: {
        create: jest.fn(({ data }) => Promise.resolve({ id: '1', url: data.url })),
      },
    };
    authService = { verifyToken: jest.fn() };
    rateLimit = new RateLimitService();
    controller = new AnalyticsController(prisma as any, authService as any, rateLimit);
  });

  it('tracks valid page views and normalizes query strings/trailing slashes', async () => {
    const req = { headers: {}, ip: '192.0.2.1' } as any;
    const res = await controller.track({ url: '/blog/my-post/?utm_source=x' }, req);
    expect(prisma.pageView.create).toHaveBeenCalledWith({ data: { url: '/blog/my-post' } });
    expect(res).toEqual({ id: '1', url: '/blog/my-post' });
  });

  it('silently drops requests after 60/min from the same IP without throwing', async () => {
    const req = { headers: {}, ip: '192.0.2.2' } as any;
    for (let i = 0; i < 60; i++) {
      await controller.track({ url: '/about' }, req);
    }
    expect(prisma.pageView.create).toHaveBeenCalledTimes(60);

    const throttled = await controller.track({ url: '/about' }, req);
    expect(throttled).toEqual({ success: true, throttled: true });
    expect(prisma.pageView.create).toHaveBeenCalledTimes(60);
  });

  it('rejects malformed or overly long URLs with BadRequestException', () => {
    const req = { headers: {}, ip: '192.0.2.3' } as any;
    expect(() => controller.track({ url: 'https://evil.example/foo' }, req)).toThrow(BadRequestException);
    expect(() => controller.track({ url: `/${'a'.repeat(500)}` }, req)).toThrow(BadRequestException);
  });
});
