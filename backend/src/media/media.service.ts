import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
