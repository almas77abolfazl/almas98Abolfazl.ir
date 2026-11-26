import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type sharp from 'sharp';

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface DetectedImageType {
  ext: '.jpg' | '.png' | '.webp';
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

const OPTIMIZABLE_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/tiff',
  'image/bmp',
  'image/avif',
]);

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private sharpLoader: typeof sharp | null | undefined;

  private get uploadsDir(): string {
    return join(process.cwd(), 'uploads');
  }

  private getSharp(): typeof sharp | null {
    if (this.sharpLoader !== undefined) {
      return this.sharpLoader;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('sharp');
      this.sharpLoader = (mod?.default ?? mod) as typeof sharp;
    } catch (err) {
      this.logger.warn(
        `sharp is unavailable in this runtime; falling back to unoptimized image storage: ${err instanceof Error ? err.message : String(err)}`,
      );
      this.sharpLoader = null;
    }
    return this.sharpLoader;
  }

  /**
   * Inspects file magic bytes and returns a safe image extension/MIME pair,
   * or null if the buffer is not a valid JPEG, PNG, or WebP image.
   */
  detectSafeImageType(buffer: Buffer): DetectedImageType | null {
    if (!buffer || buffer.length < 12) {
      return null;
    }
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { ext: '.jpg', mimeType: 'image/jpeg' };
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { ext: '.png', mimeType: 'image/png' };
    }
    // WebP: RIFF....WEBP
    if (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      return { ext: '.webp', mimeType: 'image/webp' };
    }
    return null;
  }

  /**
   * Saves an admin-uploaded file, converting raster images (excluding GIFs/SVGs/favicons)
   * to resized WebP while stripping EXIF metadata.
   */
  async save(file: UploadedFile) {
    if (OPTIMIZABLE_IMAGE_MIMES.has(file.mimetype?.toLowerCase())) {
      try {
        const optimized = await this.optimizeToWebp(file.buffer, 1920);
        return this.writeToDisk(optimized, file.originalname, '.webp', 'image/webp');
      } catch {
        // Fall through to raw save if sharp cannot decode the buffer
      }
    }
    const ext = file.originalname.includes('.')
      ? file.originalname.slice(file.originalname.lastIndexOf('.'))
      : '';
    return this.writeToDisk(file.buffer, file.originalname, ext, file.mimetype);
  }

  /**
   * Validates image magic bytes, converts to resized WebP (max 500px for avatars)
   * when sharp is available, and falls back to saving with the verified extension.
   */
  async saveValidatedImage(file: UploadedFile, maxWidth = 500) {
    const detected = this.detectSafeImageType(file.buffer);
    if (!detected) {
      throw new BadRequestException('Invalid image file. Only JPEG, PNG, and WebP images are allowed.');
    }
    const sharpFn = this.getSharp();
    if (!sharpFn) {
      return this.writeToDisk(file.buffer, file.originalname, detected.ext, detected.mimeType);
    }
    try {
      const optimized = await this.optimizeToWebp(file.buffer, maxWidth);
      return this.writeToDisk(optimized, file.originalname, '.webp', 'image/webp');
    } catch {
      throw new BadRequestException('Invalid or corrupted image file.');
    }
  }

  private optimizeToWebp(buffer: Buffer, maxWidth: number): Promise<Buffer> {
    const sharpFn = this.getSharp();
    if (!sharpFn) {
      return Promise.reject(new Error('sharp unavailable'));
    }
    return sharpFn(buffer)
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  }

  private writeToDisk(buffer: Buffer, originalName: string, ext: string, mimeType: string) {
    const filename = `${randomUUID()}${ext}`;
    mkdirSync(this.uploadsDir, { recursive: true });
    writeFileSync(join(this.uploadsDir, filename), buffer);
    const url = `/api/uploads/${filename}`;
    return {
      filename,
      originalName,
      mimeType,
      sizeBytes: buffer.length,
      url,
    };
  }
}
