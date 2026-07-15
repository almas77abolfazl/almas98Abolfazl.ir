import { Injectable } from '@nestjs/common';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class UploadsService {
  private get uploadsDir(): string {
    return join(process.cwd(), 'uploads');
  }

  save(file: UploadedFile) {
    const ext = file.originalname.includes('.')
      ? file.originalname.slice(file.originalname.lastIndexOf('.'))
      : '';
    const filename = `${randomUUID()}${ext}`;
    mkdirSync(this.uploadsDir, { recursive: true });
    writeFileSync(join(this.uploadsDir, filename), file.buffer);
    const url = `/api/uploads/${filename}`;
    return {
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url,
    };
  }
}
