import { BadRequestException } from '@nestjs/common';
import { UploadsService } from './uploads.service';

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(() => {
    service = new UploadsService();
  });

  it('detects JPEG magic bytes', () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(service.detectSafeImageType(buf)).toEqual({ ext: '.jpg', mimeType: 'image/jpeg' });
  });

  it('detects PNG magic bytes', () => {
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    expect(service.detectSafeImageType(buf)).toEqual({ ext: '.png', mimeType: 'image/png' });
  });

  it('detects WebP magic bytes', () => {
    const buf = Buffer.from('RIFF\x00\x00\x00\x00WEBP', 'ascii');
    expect(service.detectSafeImageType(buf)).toEqual({ ext: '.webp', mimeType: 'image/webp' });
  });

  it('rejects SVG or spoofed text content', () => {
    const svg = Buffer.from('<svg onload="alert(1)"></svg>', 'utf8');
    expect(service.detectSafeImageType(svg)).toBeNull();
    expect(() =>
      service.saveValidatedImage({
        originalname: 'avatar.png',
        mimetype: 'image/png',
        size: svg.length,
        buffer: svg,
      }),
    ).toThrow(BadRequestException);
  });
});
