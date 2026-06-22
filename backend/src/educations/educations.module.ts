import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EducationsController } from './educations.controller';
import { EducationsService } from './educations.service';

@Module({
  imports: [PrismaModule],
  controllers: [EducationsController],
  providers: [EducationsService],
})
export class EducationsModule {}
