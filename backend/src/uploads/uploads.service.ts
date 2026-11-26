import { BadRequestException, Injectable } from '@nestjs/common';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

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

@Injectable()
export class UploadsService {
  private get uploadsDir(): string {
    return join(process.cwd(), 'uploads');
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

  save(file: UploadedFile) {
    const ext = file.originalname.includes('.')
      ? file.originalname.slice(file.originalname.lastIndexOf('.'))
      : '';
    return this.writeToDisk(file, ext, file.mimetype);
  }

  /**
   * Validates image magic bytes and saves using the canonical safe extension
   * instead of trusting client-supplied filename extensions or MIME headers.
   */
  saveValidatedImage(file: UploadedFile) {
    const detected = this.detectSafeImageType(file.buffer);
    if (!detected) {
      throw new BadRequestException('Invalid image file. Only JPEG, PNG, and WebP images are allowed.');
    }
    return this.writeToDisk(file, detected.ext, detected.mimeType);
  }

  private writeToDisk(file: UploadedFile, ext: string, mimeType: string) {
    const filename = `${randomUUID()}${ext}`;
    mkdirSync(this.uploadsDir, { recursive: true });
    writeFileSync(join(this.uploadsDir, filename), file.buffer);
    const url = `/api/uploads/${filename}`;
    return {
      filename,
      originalName: file.originalname,
      mimeType,
      sizeBytes: file.size,
      url,
    };
  }
}
