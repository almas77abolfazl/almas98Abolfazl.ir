import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AboutMeController } from './about-me.controller';
import { AboutMeService } from './about-me.service';

@Module({
  imports: [PrismaModule],
  controllers: [AboutMeController],
  providers: [AboutMeService],
})
export class AboutMeModule {}
