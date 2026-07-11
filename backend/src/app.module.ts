import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AboutMeModule } from './about-me/about-me.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { EducationsModule } from './educations/educations.module';
import { SkillsModule } from './skills/skills.module';
import { ArticlesModule } from './articles/articles.module';
import { MediaModule } from './media/media.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [PrismaModule, AboutMeModule, ExperiencesModule, EducationsModule, SkillsModule, ArticlesModule, MediaModule, AuthModule, AdminModule, ContactMessagesModule, AnalyticsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
