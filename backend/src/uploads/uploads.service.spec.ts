import { BadRequestException } from '@nestjs/common';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { UploadsService } from './uploads.service';

describe('UploadsService', () => {
  let service: UploadsService;
  const createdFiles: string[] = [];

  beforeEach(() => {
    service = new UploadsService();
  });

  afterEach(() => {
    for (const file of createdFiles.splice(0)) {
      const p = join(process.cwd(), 'uploads', file);
      if (existsSync(p)) unlinkSync(p);
    }
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

  it('rejects SVG or spoofed text content', async () => {
    const svg = Buffer.from('<svg onload="alert(1)"></svg>', 'utf8');
    expect(service.detectSafeImageType(svg)).toBeNull();
    await expect(
      service.saveValidatedImage({
        originalname: 'avatar.png',
        mimetype: 'image/png',
        size: svg.length,
        buffer: svg,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('converts and resizes valid PNG images to WebP', async () => {
    const pngBuffer = await sharp({
      create: { width: 800, height: 400, channels: 3, background: { r: 100, g: 150, b: 200 } },
    })
      .png()
      .toBuffer();

    const saved = await service.saveValidatedImage(
      {
        originalname: 'avatar.png',
        mimetype: 'image/png',
        size: pngBuffer.length,
        buffer: pngBuffer,
      },
      500,
    );
    createdFiles.push(saved.filename);

    expect(saved.filename.endsWith('.webp')).toBe(true);
    expect(saved.mimeType).toBe('image/webp');
    expect(saved.url).toBe(`/api/uploads/${saved.filename}`);
    const meta = await sharp(readFileSync(join(process.cwd(), 'uploads', saved.filename))).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(500);
  });
});
