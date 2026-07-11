import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildEmbedUrl } from './embed-url.util';

@Injectable()
export class VideosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const videos = await this.prisma.videos.findMany({
      orderBy: { order: 'asc' },
    });
    return videos.map((video) => ({
      ...video,
      embedUrl: buildEmbedUrl(video.platform, video.videoId),
    }));
  }
}
