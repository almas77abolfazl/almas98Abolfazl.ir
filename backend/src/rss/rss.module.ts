import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RssController } from './rss.controller';
import { RssService } from './rss.service';

@Module({
  imports: [PrismaModule],
  controllers: [RssController],
  providers: [RssService],
})
export class RssModule {}
