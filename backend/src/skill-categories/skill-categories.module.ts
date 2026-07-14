import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SkillCategoriesController } from './skill-categories.controller';
import { SkillCategoriesService } from './skill-categories.service';

@Module({
  imports: [PrismaModule],
  controllers: [SkillCategoriesController],
  providers: [SkillCategoriesService],
})
export class SkillCategoriesModule {}
