import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AboutMeModule } from './about-me/about-me.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { EducationsModule } from './educations/educations.module';
import { SkillsModule } from './skills/skills.module';
import { ArticlesModule } from './articles/articles.module';
import { MediaModule } from './media/media.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    PrismaModule,
    AboutMeModule,
    ExperiencesModule,
    EducationsModule,
    SkillsModule,
    ArticlesModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
