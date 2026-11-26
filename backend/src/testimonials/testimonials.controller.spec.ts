import { BadRequestException, HttpException } from '@nestjs/common';
import { TestimonialsController } from './testimonials.controller';
import { RateLimitService } from '../common/rate-limit.service';

describe('TestimonialsController (upload)', () => {
  let controller: TestimonialsController;
  let rateLimit: RateLimitService;
  let testimonialsService: { uploadImage: jest.Mock };

  beforeEach(() => {
    rateLimit = new RateLimitService();
    testimonialsService = {
      uploadImage: jest.fn((file) => ({
        filename: 'uuid.png',
        originalName: file.originalname,
        mimeType: 'image/png',
        sizeBytes: file.size,
        url: '/api/uploads/uuid.png',
      })),
    };
    controller = new TestimonialsController(testimonialsService as any, rateLimit);
  });

  it('allows up to 5 uploads per IP and throws 429 on the 6th', async () => {
    const req = { ip: '203.0.113.10' } as any;
    const validFile = {
      originalname: 'avatar.png',
      mimetype: 'image/png',
      size: 16,
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]),
    };

    for (let i = 0; i < 5; i++) {
      const res = await controller.upload(req, validFile);
      expect(res.url).toBe('/api/uploads/uuid.png');
    }

    expect(() => controller.upload(req, validFile)).toThrow(HttpException);
    try {
      controller.upload(req, validFile);
    } catch (err) {
      expect((err as HttpException).getStatus()).toBe(429);
    }
  });

  it('throws BadRequestException when file is missing', () => {
    const req = { ip: '203.0.113.11' } as any;
    expect(() => controller.upload(req, undefined as any)).toThrow(BadRequestException);
  });
});
